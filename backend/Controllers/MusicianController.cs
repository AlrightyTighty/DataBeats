using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Admin;
using backend.DTOs.Musician;
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
            var cutoff = DateTime.UtcNow.AddDays(-30);
            
            if (!includeImageData)
            {
                var result = new List<object>();
                foreach (var m in musicians)
                {
                    var monthlyListeners = await _context.UserListensToSongs
                        .AsNoTracking()
                        .Where(r => r.TimeListened >= cutoff)
                        .Where(r =>
                            r.Song.CreatedBy == m.MusicianId
                            || r.Song.MusicianWorksOnSongs.Any(mws => mws.MusicianId == m.MusicianId)
                        )
                        .Select(r => r.UserId)
                        .Distinct()
                        .CountAsync();
                    
                    result.Add(new
                    {
                        m.MusicianId,
                        m.MusicianName,
                        m.ProfilePictureFileId,
                        m.FollowerCount,
                        MonthlyListenerCount = monthlyListeners,
                        m.IsVerified,
                    });
                }
                return Ok(result.ToArray());
            }
            var withImages = new List<object>(musicians.Count);
            foreach (var m in musicians)
            {
                var monthlyListeners = await _context.UserListensToSongs
                    .AsNoTracking()
                    .Where(r => r.TimeListened >= cutoff)
                    .Where(r =>
                        r.Song.CreatedBy == m.MusicianId
                        || r.Song.MusicianWorksOnSongs.Any(mws => mws.MusicianId == m.MusicianId)
                    )
                    .Select(r => r.UserId)
                    .Distinct()
                    .CountAsync();
                
                var file = await _context.ProfilePictureFiles.FindAsync(m.ProfilePictureFileId);
                withImages.Add(new
                {
                    m.MusicianId,
                    m.MusicianName,
                    m.ProfilePictureFileId,
                    m.FollowerCount,
                    MonthlyListenerCount = monthlyListeners,
                    m.IsVerified,
                    profilePictureImage = file != null ? Convert.ToBase64String(file.FileData) : null,
                    fileExtension = file?.FileExtension
                });
            }
            return Ok(withImages.ToArray());
        }
        

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMusicianAsync([FromRoute] ulong id)
        {
            var musician = await _context.Musicians
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MusicianId == id && m.TimestampDeleted == null);

            if (musician == null)
                return NotFound();

            var cutoff = DateTime.UtcNow.AddDays(-30);

            var monthlyListeners = await _context.UserListensToSongs
                .AsNoTracking()
                .Where(r => r.TimeListened >= cutoff)
                .Where(r =>
                    r.Song.CreatedBy == id
                    || r.Song.MusicianWorksOnSongs.Any(mws => mws.MusicianId == id)
                )
                .Select(r => r.UserId)
                .Distinct()
                .CountAsync();

            var dto = musician.ToDto();
            dto.MonthlyListenerCount = monthlyListeners;

            return Ok(dto);
        }
        
        private ApplicationDBContext _context;

        public MusicianController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreateMusicianAsync([FromBody] CreateMusicianDto dto)
        {
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            User user = (await _context.Users.FindAsync(userId))!;

            if (user.MusicianId != null)
                return BadRequest("You can't make a musician account if you already have one");

            Musician newMusician = new Musician
            {
                UserId = userId,
                MusicianName = dto.MusicianName,
                Bio = dto.Bio,
                Label = dto.Label,
                ProfilePictureFileId = dto.ProfilePictureFileId,
                CreatedBy = userId,
                TimestampCreated = DateTime.Now,
                FollowerCount = 0,
                MonthlyListenerCount = 0,
                IsVerified = false
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

        [HttpPost("/admin/delete/musician/{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AdminDeleteByIdAsync([FromRoute] ulong id, [FromBody] AdminDeleteRequest request)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User deletingUser = (await _context.Users.FindAsync(userId))!;
            Musician? musicianToDelete = await _context.Musicians.FindAsync(id);

            if (musicianToDelete == null || musicianToDelete.TimestampDeleted != null)
                return NotFound();

            // ADMIN CHECK
            if (deletingUser.AdminId == null)
                return StatusCode(StatusCodes.Status403Forbidden);

            ulong? adminId = deletingUser.AdminId;

            // RESOLVE ASSOCIATED REPORTS IF REQUESTED
            if (request.ResolveReports)
            {
                var unresolvedComplaints = await _context.Complaints
                    .Include(c => c.Reviews)
                    .Where(c => c.ComplaintType == "MUSICIAN" && c.ComplaintTargetId == id && c.Reviews.Count == 0)
                    .ToListAsync();

                foreach (var complaint in unresolvedComplaints)
                {
                    Review autoReview = new Review
                    {
                        AdminId = adminId.Value,
                        ComplaintId = complaint.ComplaintId,
                        TimestampCreated = DateTime.Now,
                        CreatedBy = userId,
                        ReviewComment = "Automatically resolved after deletion of offending content"
                    };
                    await _context.Reviews.AddAsync(autoReview);
                }
            }

            // CREATE TRACKING ENTITY
            AdminDeletesMusician adminAction = new AdminDeletesMusician
            {
                AdminId = adminId.Value,
                MusicianId = id,
                DeletedAt = DateTime.Now,
                Reason = request.Reason
            };

            // SAVE TRACKING AND SOFT DELETE
            await _context.AdminDeletesMusicians.AddAsync(adminAction);
            musicianToDelete.TimestampDeleted = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> DeleteByIdAsync([FromRoute] ulong id)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User user = (await _context.Users.FindAsync(userId))!;
            bool isAdmin = user.AdminId != null;

            Musician? musicianToDelete = await _context.Musicians.FindAsync(id);

            if (musicianToDelete == null || musicianToDelete.TimestampDeleted != null)
                return NotFound();

            // Allow if admin OR musician is deleting their own account
            if (!isAdmin && user.MusicianId != id)
                return StatusCode(StatusCodes.Status403Forbidden);

            musicianToDelete.TimestampDeleted = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}