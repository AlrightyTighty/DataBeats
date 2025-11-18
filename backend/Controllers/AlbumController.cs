using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using backend.DTOs;
using backend.DTOs.Album;
using backend.DTOs.Song;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace backend.Controllers
{
    [Route("api/album")]
    [ApiController]
    public class AlbumController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public AlbumController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] ulong id, [FromQuery] bool includeImageData = false)
        {
            Album? album = await _context.Albums.Where(album => album.TimestampDeleted == null).Include(album => album.MusicianWorksOnAlbums).ThenInclude(albumArtist => albumArtist.Musician).FirstOrDefaultAsync(album => album.AlbumId == id);
            if (album == null || album.TimestampDeleted != null)
                return NotFound("There is no such album with id " + id);


            if (includeImageData)
            {
                AlbumOrSongArtFile albumArtFile = (await _context.AlbumOrSongArtFiles.FindAsync(album.AlbumOrSongArtFileId))!;
                return Ok(album.ToDTOWithImageData(albumArtFile.FileData));
            }

            return Ok(album.ToDTO());
        }

        // List all non-deleted albums with basic info + artist collaborators
        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] bool includeImageData = false)
        {
            var query = _context.Albums
                .Where(a => a.TimestampDeleted == null)
                .Include(a => a.MusicianWorksOnAlbums)
                .ThenInclude(mwa => mwa.Musician);

            // If image data requested, we still project individually to avoid loading huge blobs unnecessarily (could optimize later)
            var albums = await query.ToListAsync();

            if (!includeImageData)
            {
                return Ok(albums.Select(a => a.ToDTO()).ToArray());
            }

            // Load image file data for each
            var withImages = new List<AlbumDto>(albums.Count);
            foreach (var a in albums)
            {
                var file = await _context.AlbumOrSongArtFiles.FindAsync(a.AlbumOrSongArtFileId);
                withImages.Add(a.ToDTOWithImageData(file?.FileData ?? Array.Empty<byte>()));
            }
            return Ok(withImages.ToArray());
        }

        [HttpGet("songs/{id}")]
        public async Task<IActionResult> GetAllSongsAsync([FromRoute] ulong id)
        {
            // Load data with includes first, then project in-memory
            var songsWithIncludes = await _context.Songs
                .Where(song => song.AlbumId == id)
                .Where(song => song.TimestampDeleted == null)
                .Include(song => song.Album)
                .Include(song => song.SongGenres)
                .Include(song => song.MusicianWorksOnSongs)
                .ThenInclude(songArtist => songArtist.Musician)
                .ToListAsync();

            SongDto[] songs = songsWithIncludes
                .Select(song => song.ToSongDTOForStreaming(song.Album.AlbumOrSongArtFileId, song.Album.AlbumTitle))
                .ToArray();

            return Ok(songs);
        }

        [HttpGet("by-musician/{musicianId}")]
        public async Task<IActionResult> GetByMusician([FromRoute] ulong musicianId)
        {
            var albums = await _context.Albums
                .Where(album => album.TimestampDeleted == null)
                .Where(album => album.MusicianWorksOnAlbums.Any(mwa => mwa.MusicianId == musicianId))
                .ToListAsync();

            if (!albums.Any())
                return NotFound(new { message = "No albums found for this musician." });

            var albumDtos = albums.Select(album => album.ToDTOWithImageData(album.AlbumOrSongArtFile?.FileData ?? Array.Empty<byte>()));
            return Ok(albumDtos);
        }

        [HttpPost("/admin/delete/album/{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AdminDeleteByIdAsync([FromRoute] ulong id, [FromBody] string reason)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User deletingUser = (await _context.Users.FindAsync(userId))!;
            Album? albumToDelete = await _context.Albums.FindAsync(id);
            if (albumToDelete == null || albumToDelete.TimestampDeleted != null)
                return NotFound();

            if (deletingUser.AdminId == null)
                return StatusCode(StatusCodes.Status403Forbidden);

            // in this case, the user is acting as an admin, and therefore the action must be logged.
            // ALL admin deletes must be logged.
            ulong? adminId = deletingUser.AdminId;

            AdminDeletesAlbum adminAction = new AdminDeletesAlbum
            {
                AdminId = adminId.Value,
                AlbumId = id,
                DeletedAt = DateTime.Now,
                Reason = reason
            };

            await _context.AdminDeletesAlbums.AddAsync(adminAction);
            albumToDelete.TimestampDeleted = DateTime.Now;
            albumToDelete.DeletedBy = userId;
            await _context.SaveChangesAsync();

            return Created(uri: null as string, adminAction);
        }

        [HttpDelete("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> DeleteByIdAsync([FromRoute] ulong id)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);

            User deletingUser = (await _context.Users.FindAsync(userId))!;

            Album? albumToDelete = await _context.Albums.FindAsync(id);
            if (albumToDelete == null)
                return NotFound();

            if (albumToDelete.CreatedBy != deletingUser.MusicianId)
                return StatusCode(StatusCodes.Status403Forbidden);

            _context.Songs
                        .Where(s => s.AlbumId == id)
                        .ExecuteUpdate(s => s.SetProperty(s => s.TimestampDeleted, DateTime.Now));

            albumToDelete.TimestampDeleted = DateTime.Now;
            albumToDelete.DeletedBy = userId;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> EditAlbumAsync([FromRoute] ulong id, [FromBody] EditAlbumRequestDto dto)
        {
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            Musician? uploadingMusician = await _context.Musicians.FirstOrDefaultAsync(musician => musician.UserId == userId && musician.TimestampDeleted == null);
            
            if (uploadingMusician == null)
                return Forbid("You cannot edit an album if you do not have a musician account.");
            
            Console.WriteLine(uploadingMusician.MusicianId);

            Album? albumToEdit = await _context.Albums.FirstOrDefaultAsync(album => album.AlbumId == id && album.TimestampDeleted == null);

            if (albumToEdit == null)
                return NotFound();

            if (albumToEdit.CreatedBy != uploadingMusician.MusicianId)
                return Forbid("You can only edit albums which you have created.");

            // Update album title
            albumToEdit.AlbumTitle = dto.AlbumTitle;

            // Update album art
            AlbumOrSongArtFile? artFile = await _context.AlbumOrSongArtFiles.FindAsync(dto.AlbumOrSongArtFileId);
            if (artFile == null)
                return NotFound("Album art file not found");
            albumToEdit.AlbumOrSongArtFileId = dto.AlbumOrSongArtFileId;

            // Update album-level artists (differential update)
            var currentAlbumArtists = await _context.MusicianWorksOnAlbums
                .Where(mwa => mwa.AlbumId == id)
                .Include(mwa => mwa.Musician)
                .ToListAsync();

            var currentArtistNames = currentAlbumArtists.Select(mwa => mwa.Musician.MusicianName).ToHashSet();
            var newArtistNames = dto.ArtistNames.ToHashSet();

            // Ensure uploading musician is always included
            if (!newArtistNames.Contains(uploadingMusician.MusicianName))
            {
                newArtistNames.Add(uploadingMusician.MusicianName);
            }

            // Remove artists that are no longer in the list (except uploading musician)
            foreach (var association in currentAlbumArtists)
            {
                if (!newArtistNames.Contains(association.Musician.MusicianName) &&
                    association.MusicianId != uploadingMusician.MusicianId)
                {
                    _context.MusicianWorksOnAlbums.Remove(association);
                }
            }

            // Add new artists
            foreach (string artistName in newArtistNames)
            {
                if (!currentArtistNames.Contains(artistName))
                {
                    Musician? artist = await _context.Musicians
                        .FirstOrDefaultAsync(m => m.MusicianName == artistName && m.TimestampDeleted == null);

                    if (artist == null)
                        return NotFound($"No musician found with name {artistName}");

                    MusicianWorksOnAlbum association = new MusicianWorksOnAlbum
                    {
                        AlbumId = id,
                        MusicianId = artist.MusicianId,
                        DateAdded = DateTime.Now
                    };
                    await _context.MusicianWorksOnAlbums.AddAsync(association);
                }
            }

            foreach (ulong songId in dto.SongsToRemove)
            {
                Song? song = await _context.Songs.FirstOrDefaultAsync(song => song.SongId == songId && song.TimestampDeleted == null);
                if (song == null)
                    return NotFound("Couldn't find song with that ID");

                song.TimestampDeleted = DateTime.Now;
            }

            foreach (CreateSongDto songDto in dto.SongsToAdd)
            {
                SongFile? songFile = await _context.SongFiles.FindAsync(songDto.SongFileId);

                if (songFile == null)
                    return NotFound();

                Song newSong = new Song
                {
                    AlbumId = albumToEdit.AlbumId,
                    SongName = songDto.SongName,
                    Lyrics = songDto.Lyrics,
                    Streams = 0,
                    Duration = songFile.Duration,
                    TimestampCreated = DateTime.Now,
                    CreatedBy = uploadingMusician.MusicianId,
                    SongFileId = songDto.SongFileId,
                };

                await _context.Songs.AddAsync(newSong);

                // Ensure uploading musician is always included
                var artistNamesSet = songDto.ArtistNames.ToHashSet();
                if (!artistNamesSet.Contains(uploadingMusician.MusicianName))
                {
                    artistNamesSet.Add(uploadingMusician.MusicianName);
                }

                foreach (string artistName in artistNamesSet)
                {
                    Musician? contributingArtist = await _context.Musicians.FirstOrDefaultAsync(artist => artist.MusicianName == artistName && artist.TimestampDeleted == null);

                    if (contributingArtist == null)
                        return NotFound($"No musician found with name {artistName}");

                    MusicianWorksOnSong contribution = new MusicianWorksOnSong
                    {
                        DateAdded = DateTime.Now,
                        Musician = contributingArtist,
                        Song = newSong
                    };

                    await _context.MusicianWorksOnSongs.AddAsync(contribution);
                }

                foreach (string genre in songDto.Genres)
                {
                    SongGenre newGenre = new SongGenre
                    {
                        Genre = genre,
                        Song = newSong,
                        CreatedBy = uploadingMusician.MusicianId,
                        TimestampCreated = DateTime.Now
                    };

                    await _context.SongGenres.AddAsync(newGenre);
                }
            }

            foreach (EditSongDto songDto in dto.SongsToEdit)
            {
                Song? songToEdit = await _context.Songs.FindAsync(songDto.SongId);
                if (songToEdit == null)
                    return NotFound();

                songToEdit.SongName = songDto.songInfo.SongName;
                songToEdit.Lyrics = songDto.songInfo.Lyrics;
                songToEdit.SongFileId = songDto.songInfo.SongFileId;
                songToEdit.Duration = (await _context.SongFiles.FindAsync(songDto.songInfo.SongFileId))!.Duration;

                // Update song genres (existing differential logic)
                List<SongGenre> currentSongGenres = await _context.SongGenres
                                                                    .Where(genre => genre.SongId == songDto.SongId)
                                                                    .ToListAsync();

                // Apply DistinctBy in-memory (EF cannot translate DistinctBy to SQL)
                currentSongGenres = currentSongGenres.DistinctBy(genre => genre.Genre).ToList();

                foreach (string genre in songDto.songInfo.Genres)
                {
                    if (!currentSongGenres.Any(g => g.Genre == genre))
                    {
                        SongGenre newGenre = new SongGenre
                        {
                            Song = songToEdit,
                            Genre = genre,
                            CreatedBy = uploadingMusician.MusicianId,
                            TimestampCreated = DateTime.Now
                        };

                        await _context.SongGenres.AddAsync(newGenre);
                    }
                }

                foreach (SongGenre genre in currentSongGenres)
                {
                    if (!songDto.songInfo.Genres.Any(g => g == genre.Genre))
                    {
                        _context.SongGenres.Remove(genre);
                    }
                }

                // Update song musicians (differential update, similar to genres)
                List<MusicianWorksOnSong> currentSongMusicians = await _context.MusicianWorksOnSongs
                                                                    .Where(mws => mws.SongId == songDto.SongId)
                                                                    .Include(mws => mws.Musician)
                                                                    .ToListAsync();

                var currentMusicianNames = currentSongMusicians.Select(mws => mws.Musician.MusicianName).ToHashSet();
                var newMusicianNames = songDto.songInfo.ArtistNames.ToHashSet();

                // Ensure uploading musician is always included
                if (!newMusicianNames.Contains(uploadingMusician.MusicianName))
                {
                    newMusicianNames.Add(uploadingMusician.MusicianName);
                }

                // Add new musicians
                foreach (string musicianName in newMusicianNames)
                {
                    if (!currentMusicianNames.Contains(musicianName))
                    {
                        Musician? musician = await _context.Musicians
                            .FirstOrDefaultAsync(m => m.MusicianName == musicianName && m.TimestampDeleted == null);

                        if (musician == null)
                            return NotFound($"No musician found with name {musicianName}");

                        MusicianWorksOnSong contribution = new MusicianWorksOnSong
                        {
                            DateAdded = DateTime.Now,
                            Musician = musician,
                            Song = songToEdit
                        };

                        await _context.MusicianWorksOnSongs.AddAsync(contribution);
                    }
                }

                // Remove musicians that are no longer in the list (except uploading musician)
                foreach (var musicianAssociation in currentSongMusicians)
                {
                    if (!newMusicianNames.Contains(musicianAssociation.Musician.MusicianName) &&
                        musicianAssociation.MusicianId != uploadingMusician.MusicianId)
                    {
                        _context.MusicianWorksOnSongs.Remove(musicianAssociation);
                    }
                }
            }

            // Update NumSongs, AlbumType, and Duration
            int totalSongs = await _context.Songs
                .Where(s => s.AlbumId == id && s.TimestampDeleted == null)
                .CountAsync();
            albumToEdit.NumSongs = totalSongs;
            albumToEdit.AlbumType = totalSongs == 1 ? "SINGLE" : totalSongs < 5 ? "EP" : "ALBUM";

            var allSongs = await _context.Songs
                .Where(s => s.AlbumId == id && s.TimestampDeleted == null)
                .ToListAsync();
            albumToEdit.Duration = new TimeOnly(allSongs.Sum(song => song.Duration.Ticks));

            await _context.SaveChangesAsync();

            return Ok();

        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreateAlbumAsync([FromBody] CreateAlbumRequestDto albumInfo)
        {
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            Musician? uploadingMusician = await _context.Musicians.FirstOrDefaultAsync(musician => musician.UserId == userId && musician.TimestampDeleted == null);
            if (uploadingMusician == null)
                return Unauthorized("User does not have an associated musician account.");

            Dictionary<string, Musician> musicianMap = new Dictionary<string, Musician>();

            // Ensure uploading musician is always in album artists
            var albumMusicianNames = albumInfo.MusicianNames.ToHashSet();
            if (!albumMusicianNames.Contains(uploadingMusician.MusicianName))
            {
                albumMusicianNames.Add(uploadingMusician.MusicianName);
            }

            List<Musician> musicians = new List<Musician>();
            foreach (string musicianName in albumMusicianNames)
            {
                Musician? musician = await _context.Musicians.FirstOrDefaultAsync(musician => musician.MusicianName == musicianName && musician.TimestampDeleted == null);
                if (musician == null)
                    return NotFound("No musician exists with name " + musicianName);

                musicianMap[musicianName] = musician;
                musicians.Add(musician);
            }

            List<Song> songs = new List<Song>();

            int i = 0;

            foreach (CreateSongDto songDto in albumInfo.Songs)
            {

                SongFile? songFile = await _context.SongFiles.FindAsync(songDto.SongFileId);

                if (songFile == null)
                    return NotFound("No such song file exists with id " + songDto.SongFileId);

                Song newSong = new Song
                {
                    SongName = songDto.SongName,
                    Lyrics = songDto.Lyrics,
                    Streams = 0,
                    Duration = songFile.Duration,
                    TimestampCreated = DateTime.Now,
                    CreatedBy = uploadingMusician.MusicianId,
                    SongFileId = songDto.SongFileId,
                };

                string[] musicianNames = albumInfo.MusicianNamesPerSong[i];

                // Ensure uploading musician is always included
                var musicianNamesSet = musicianNames.ToHashSet();
                if (!musicianNamesSet.Contains(uploadingMusician.MusicianName))
                {
                    musicianNamesSet.Add(uploadingMusician.MusicianName);
                }

                List<Musician> musiciansPerThisSong = new List<Musician>();

                foreach (string musicianName in musicianNamesSet)
                {
                    Musician? newMusician = musicianMap[musicianName] ?? await _context.Musicians.FirstOrDefaultAsync(m => m.MusicianName == musicianName && m.TimestampDeleted == null);
                    if (newMusician == null)
                        return NotFound("No musician found with name " + musicianName);

                    musicianMap[musicianName] = newMusician;
                    musiciansPerThisSong.Add(newMusician);
                }

                foreach (Musician musician in musiciansPerThisSong)
                {
                    MusicianWorksOnSong musicianWorksOnSong = new MusicianWorksOnSong
                    {
                        Musician = musician,
                        Song = newSong,
                        DateAdded = DateTime.Now
                    };
                    await _context.MusicianWorksOnSongs.AddAsync(musicianWorksOnSong);
                }

                foreach (string genre in albumInfo.GenresPerSong[i])
                {
                    SongGenre songGenre = new SongGenre
                    {
                        Song = newSong,
                        Genre = genre,
                        CreatedBy = uploadingMusician.MusicianId,
                        TimestampCreated = DateTime.Now
                    };
                    await _context.SongGenres.AddAsync(songGenre);
                }

                songs.Add(newSong);
                await _context.Songs.AddAsync(newSong);
            }

            Album newAlbum = new Album
            {
                AlbumTitle = albumInfo.AlbumTitle,
                AlbumType = albumInfo.Songs.Count == 1 ? "SINGLE" : albumInfo.Songs.Count < 5 ? "EP" : "ALBUM",
                ReleaseDate = DateTime.Now,
                NumSongs = albumInfo.Songs.Count,
                CreatedBy = uploadingMusician.MusicianId,
                AlbumOrSongArtFileId = albumInfo.AlbumOrSongArtFileId,
                Duration = new TimeOnly(songs.Sum(song => song.Duration.Ticks)),
                TimestampCreated = DateTime.Now
            };

            foreach (Song song in songs)
            {
                song.Album = newAlbum;
            }

            foreach (Musician musician in musicians)
            {
                await _context.MusicianWorksOnAlbums.AddAsync(new MusicianWorksOnAlbum
                {
                    Musician = musician,
                    Album = newAlbum,
                    DateAdded = DateTime.Now
                });
            }

            await _context.Albums.AddAsync(newAlbum);
            await _context.SaveChangesAsync();

            newAlbum = await _context.Albums.Include(album => album.MusicianWorksOnAlbums).ThenInclude(albumArtist => albumArtist.Musician).FirstAsync(album => album.AlbumId == newAlbum.AlbumId);

            return CreatedAtAction("GetById", new { id = newAlbum.AlbumId }, newAlbum.ToDTO());
        }

    }
}