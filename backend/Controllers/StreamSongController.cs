using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{

    [ApiController]
    [Route("/api/stream")]
    public class StreamSongController : ControllerBase
    {

        private ApplicationDBContext _context;

        public StreamSongController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPatch("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> StreamSongAsync([FromRoute] ulong id)
        {
            Song? songToStream = await _context.Songs.FindAsync(id);

            if (songToStream == null)
                return NotFound("No song with id " + id + " was found");

            UserListensToSong userListensToSong = new UserListensToSong
            {
                UserId = ulong.Parse(Request.Headers["X-UserId"]!),
                SongId = id,
                TimeListened = DateTime.Now
            };

            await _context.UserListensToSongs.AddAsync(userListensToSong);

            await _context.SaveChangesAsync();

            SongFile? songFile = await _context.SongFiles.FindAsync(songToStream.SongFileId);
             
            if (songFile == null)
                return NotFound();

            return Ok(songFile.ToDto());
        }

    }
}