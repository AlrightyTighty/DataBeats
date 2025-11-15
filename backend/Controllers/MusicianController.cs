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
    
    [Route("/api/musician")]
    [ApiController]
    public class MusicianController : ControllerBase
    {
        // GET /api/musician/all?includeImageData=true
        [HttpGet("all")]
        public async Task<IActionResult> GetAllMusiciansAsync([FromQuery] bool includeImageData = false)
        {
            var query = _context.Musicians.Where(m => m.TimestampDeleted == null);
            var musicians = await query.ToListAsync();
            if (!includeImageData)
            {
                return Ok(musicians.Select(m => new {
                    m.MusicianId,
                    m.MusicianName,
                    m.ProfilePictureFileId
                }).ToArray());
            }
            var withImages = new List<object>(musicians.Count);
            foreach (var m in musicians)
            {
                var file = await _context.ProfilePictureFiles.FindAsync(m.ProfilePictureFileId);
                withImages.Add(new {
                    m.MusicianId,
                    m.MusicianName,
                    m.ProfilePictureFileId,
                    profilePictureImage = file != null ? Convert.ToBase64String(file.FileData) : null,
                    fileExtension = file?.FileExtension
                });
            }
            return Ok(withImages.ToArray());
        }
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

        [HttpPut("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> UpdateMusicianAsync([FromRoute] ulong id, [FromBody] UpdateMusicianDto dto)
        {
            // fetch musician drom db
            Musician? musician = await _context.Musicians.FindAsync(id);
            if (musician == null)
            {
                return NotFound();
            }

            // update stage name
            if (!string.IsNullOrWhiteSpace(dto.MusicianName))
            {
                musician.MusicianName = dto.MusicianName;
            }

            // update pfp
            if (dto.ProfilePictureFileId.HasValue)
            {
                musician.ProfilePictureFileId = dto.ProfilePictureFileId.Value;
            }

            // update bio if exists in dto
            if (!string.IsNullOrWhiteSpace(dto.Bio))
            {
                musician.Bio = dto.Bio;
            }

            // save
            await _context.SaveChangesAsync();

            // return updated musician dto
            return Ok(musician.ToDto());
        }

        [HttpPost("{id}/follow")]
        public async Task<IActionResult> FollowArtist([FromRoute] ulong id)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            var artist = await _context.Musicians.FindAsync(id);
            if (artist == null) return NotFound();
            artist.FollowerCount++;
            await _context.SaveChangesAsync();
            return Ok();
        }

    }
}