using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
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
            SongDto[] songs = await _context.Songs.Where(song => song.AlbumId == id).Where(song => song.TimestampDeleted == null).Include(song => song.Album).Include(song => song.MusicianWorksOnSongs).ThenInclude(songArtist => songArtist.Musician).Select(song => song.ToSongDTOForStreaming(song.Album.AlbumOrSongArtFileId, song.Album.AlbumTitle)).ToArrayAsync();

            return Ok(songs);
        }

        [HttpGet("by-musician/{musicianId}")]
        public async Task<IActionResult> GetByMusician([FromRoute] ulong musicianId)
        {
            var albums = await _context.Albums
                .Where(album => album.TimestampDeleted == null)
                .Where(album => album.MusicianWorksOnAlbums.Any(mwa => mwa.MusicianId == musicianId))
                .Where(album => album.TimestampDeleted == null)
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
                return Forbid();

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
            Album? albumToDelete = await _context.Albums.FindAsync(id);
            if (albumToDelete == null)
                return NotFound();

            if (albumToDelete.CreatedBy != userId)
                return Forbid();

            albumToDelete.TimestampDeleted = DateTime.Now;
            albumToDelete.DeletedBy = userId;
            await _context.SaveChangesAsync();

            return NoContent();
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

            List<Musician> musicians = new List<Musician>();
            foreach (string musicianName in albumInfo.MusicianNames)
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

                List<Musician> musiciansPerThisSong = new List<Musician>();

                foreach (string musicianName in musicianNames)
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
                        TimestampCreated = DateTime.Now,
                        CreatedByNavigation = uploadingMusician,
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