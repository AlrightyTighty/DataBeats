using System;
using System.Collections.Generic;
using System.Linq;
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
        public async Task<IActionResult> GetByIdAsync([FromRoute] ulong id)
        {
            Album? album = await _context.Albums.FindAsync(id);
            if (album == null || album.TimestampDeleted != null)
                return NotFound("There is no such album with id " + id);

            return Ok(album.ToDTO());
        }

        [HttpPost("/admin/delete/album/{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AdminDeleteByIdAsync([FromRoute] ulong id, [FromBody] string reason)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User deletingUser = (await _context.Users.FindAsync(userId))!;
            Album? albumToDelete = await _context.Albums.FindAsync(id);
            if (albumToDelete == null)
                return NotFound();

            if (deletingUser.AdminId == null)
                return Unauthorized();

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
            await _context.SaveChangesAsync();

            return Created(uri: null as string, adminAction);
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreateAlbumAsync([FromBody] CreateAlbumRequestDto albumInfo)
        {
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            Musician? uploadingMusician = await _context.Musicians.FirstOrDefaultAsync(musician => musician.UserId == userId);
            if (uploadingMusician == null)
                return Unauthorized("User does not have an associated musician account.");

            List<Musician> musicians = new List<Musician>();
            foreach (ulong musicianId in albumInfo.MusicianIds)
            {
                Musician? musician = await _context.Musicians.FindAsync(musicianId);
                if (musician == null)
                    return NotFound("No musician exists with id " + musicianId);

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

                ulong[] musicianIds = albumInfo.MusicianIdsPerSong[i];

                foreach (ulong musicianId in musicianIds)
                {
                    MusicianWorksOnSong musicianWorksOnSong = new MusicianWorksOnSong
                    {
                        MusicianId = musicianId,
                        Song = newSong,
                        DateAdded = DateTime.Now
                    };
                    await _context.MusicianWorksOnSongs.AddAsync(musicianWorksOnSong);
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

            return CreatedAtAction("GetById", new {id = newAlbum.AlbumId}, newAlbum.ToDTO());

        }

    }
}