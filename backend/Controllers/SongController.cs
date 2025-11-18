using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/song")]
    [ApiController]
    public class SongController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public SongController(ApplicationDBContext context)
        {
            _context = context;
        }


        [HttpGet("list")]
        public async Task<IActionResult> List([FromQuery] string? q = null, [FromQuery] int? limit = null)
        {
            int take = Math.Clamp(limit ?? 10, 1, 200);

            var songsQuery = _context.Songs
                .AsNoTracking() //hopefully makes this faster
                .Include(s => s.Album)
                    .ThenInclude(a => a.AlbumOrSongArtFile)
                .Include(s => s.SongGenres)
                .Include(s => s.MusicianWorksOnSongs)
                    .ThenInclude(mws => mws.Musician)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var qLower = q.Trim().ToLower();
                songsQuery = songsQuery.Where(s => EF.Functions.Like(s.SongName.ToLower(), $"%{qLower}%"));
            }

            // Load data with includes first, then project in-memory
            var songsWithIncludes = await songsQuery
                .OrderBy(s => s.SongName)
                .Take(take)
                .ToListAsync();

            var items = songsWithIncludes
                .Select(s => s.ToSongDTOForStreaming(s.Album.AlbumOrSongArtFileId, s.Album.AlbumTitle))
                .ToArray();

            return Ok(items);
        }

        [HttpGet("{song_id}")]
        public async Task<IActionResult> GetSongById([FromRoute] ulong song_id)
        {
            Song? foundSong = await _context.Songs
                .Include(song => song.Album)
                .Include(song => song.SongGenres)
                .Include(song => song.MusicianWorksOnSongs)
                .ThenInclude(worksOn => worksOn.Musician)
                .FirstOrDefaultAsync(song => song.SongId == song_id);

            if (foundSong != null)
                return Ok(foundSong.ToSongDTOForStreaming(foundSong.Album.AlbumOrSongArtFileId, foundSong.Album.AlbumTitle));
            else
                return NotFound();
        }

        [HttpDelete("{song_id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> DeleteSongById([FromRoute] ulong song_id)
        {
            Song? foundSong = await _context.Songs.FirstOrDefaultAsync(song => song.SongId == song_id && song.TimestampDeleted == null);

            /*
            Console.WriteLine("WE FIND DA SONG!!!");
            Console.WriteLine(foundSong);
            */



            if (foundSong != null)
            {
                if (foundSong.CreatedBy != ulong.Parse(Request.Headers["X-UserId"]!))
                    return Forbid();

                foundSong.TimestampDeleted = DateTime.Now;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            else
                return NotFound();
        }
        
        [HttpGet("artist/{musicianId}")]
        public async Task<IActionResult> GetSongsByArtist([FromRoute] ulong musicianId)
        {
            // Load data with includes first, then project in-memory
            var songs = await _context.Songs
                .Where(s => s.TimestampDeleted == null)
                .Where(s =>
                    s.CreatedBy == musicianId ||
                    s.MusicianWorksOnSongs.Any(mws => mws.MusicianId == musicianId)
                )
                .Include(s => s.Album)
                .Include(s => s.SongGenres)
                .Include(s => s.MusicianWorksOnSongs)
                .ThenInclude(mws => mws.Musician)
                .ToListAsync();

            if (!songs.Any())
                return Ok(Array.Empty<object>());

            var dto = songs
                .Select(s => s.ToSongDTOForStreaming(
                    s.Album.AlbumOrSongArtFileId,
                    s.Album.AlbumTitle
                ))
                .ToArray();

            return Ok(dto);
        }
    }
}