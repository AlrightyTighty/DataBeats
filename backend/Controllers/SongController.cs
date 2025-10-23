using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Mappers;
using backend.Models;
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

        [HttpGet("{song_id}")]
        public async Task<IActionResult> GetSongById([FromRoute] ulong song_id)
        {
            Song? foundSong = await _context.Songs.Include(song => song.Album)
                                                  .Include(song => song.MusicianWorksOnSongs)
                                                        .ThenInclude(worksOn => worksOn.Musician)
                                                  .FirstOrDefaultAsync(song => song.SongId == song_id);
            
            if (foundSong != null)
                return Ok(foundSong.ToSongDTOIncludeArtists(foundSong.Album.AlbumTitle));
            else
                return NotFound();
        }
    }
}