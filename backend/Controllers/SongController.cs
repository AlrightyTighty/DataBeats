using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

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
        public IActionResult GetSongById([FromRoute] ulong song_id)
        {
            List<Song> foundSong = _context.Songs.Where(song => song.SongId == song_id && song.TimestampDeleted == null).ToList();
            if (foundSong.Count != 0)
                return Ok(foundSong[0].ToSongDTO());
            else
                return NotFound();
        }
    }
}