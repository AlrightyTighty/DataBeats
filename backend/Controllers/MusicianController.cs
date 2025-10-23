using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    
    [Route("/api/musician")]
    [ApiController]
    public class MusicianController : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMusicianAsync([FromRoute] ulong id)
        {
            Musician? musician = await _context.Musicians.FindAsync(id);
            if (musician == null)
                return NotFound();

            return Ok(musician.ToDto());
        }
        
        private ApplicationDBContext _context;

        public MusicianController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreateMusicianAsync()
        {
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            User user = (await _context.Users.FindAsync(userId))!;

            if (user.MusicianId != null)
                return BadRequest("You can't make a musician account if you already have one");

            Musician newMusician = new Musician
            {
                UserId = userId,
                MusicianName = user.Username,
                ProfilePictureFileId = (ulong)user.ProfilePictureFileId!,
                CreatedBy = userId,
                TimestampCreated = DateTime.Now,
                FollowerCount = 0,
                MonthlyListenerCount = 0,
            };

            _context.Musicians.Add(newMusician);
            await _context.SaveChangesAsync();

            user.MusicianId = newMusician.MusicianId;
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMusician", new { id = newMusician.MusicianId }, newMusician.ToDto());

        }
    }
}