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
            if (album == null)
                return NotFound("There is such album with id " + id);

            return Ok(album.ToDTO());
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
                    CreatedBy = userId
                };

                songs.Add(newSong);
                _context.Songs.Add(newSong);
            }

            Album newAlbum = new Album
            {
                AlbumTitle = albumInfo.AlbumTitle,
                AlbumType = albumInfo.Songs.Count == 1 ? "SINGLE" : albumInfo.Songs.Count < 5 ? "EP" : "ALBUM",
                ReleaseDate = DateTime.Now,
                NumSongs = albumInfo.Songs.Count,
                CreatedBy = userId,
                Duration = new TimeOnly(songs.Sum(song => song.Duration.Ticks))
            };

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

            return CreatedAtAction("GetById", new { newAlbum.AlbumId }, newAlbum.ToDTO());

        }

    }
}