using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Admin;
using backend.DTOs.Rating;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("/api/rating")]
    public class RatingController : ControllerBase
    {
        private ApplicationDBContext _context;

        public RatingController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet("song/{songId}")]
        public async Task<IActionResult> GetReviewPageAsync([FromRoute] ulong songId, [FromQuery] int page, [FromQuery] int count)
        {
            Console.WriteLine(songId);
            Console.WriteLine(count);
            Console.WriteLine(page);
            List<RatingDto> ratings = await _context.UserRatesSongs.Where(rating => rating.SongId == songId && rating.TimestampDeleted == null)
                                                                       .Skip((page - 1) * count)
                                                                       .Take(count)
                                                                       .Include(review => review.User)
                                                                       .Select(review => review.ToDTO())
                                                                       .ToListAsync();

        
            return Ok(ratings.ToArray());
        }

        [HttpGet("{ratingId}")]
        [ActionName(nameof(GetReviewAsync))]
        public async Task<IActionResult> GetReviewAsync([FromRoute] ulong ratingId)
        {
            UserRatesSong? rating = await _context.UserRatesSongs
                                           .Include(rating => rating.User)
                                           .FirstOrDefaultAsync(rating => rating.UserRatesSongId == ratingId && rating.TimestampDeleted == null);
            if (rating == null)
                return NotFound("No rating with id " + ratingId + " was found.");

            return Ok(rating.ToDTO());
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreateReviewAsync([FromBody] CreateRatingDto body)
        {
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            User user = (await _context.Users.FindAsync(userId))!;

            UserRatesSong newRating = new UserRatesSong
            {
                UserId = userId,
                SongId = body.SongId,
                Stars = body.StarCount.ToString(),
                Comment = body.Comment,
                TimestampCreated = DateTime.Now,
                User = user
            };

            await _context.UserRatesSongs.AddAsync(newRating);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReviewAsync), new { ratingId = newRating.UserRatesSongId }, newRating.ToDTO());
        }

        [HttpPost("/admin/delete/rating/{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AdminDeleteByIdAsync([FromRoute] ulong id, [FromBody] AdminDeleteRequest request)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User deletingUser = (await _context.Users.FindAsync(userId))!;
            UserRatesSong? ratingToDelete = await _context.UserRatesSongs.FindAsync(id);

            if (ratingToDelete == null || ratingToDelete.TimestampDeleted != null)
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
                    .Where(c => c.ComplaintType == "RATING" && c.ComplaintTargetId == id && c.Reviews.Count == 0)
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

            // CREATE TRACKING ENTITY (Note: AdminDeletesRating references ReviewId, not RatingId)
            AdminDeletesRating adminAction = new AdminDeletesRating
            {
                AdminId = adminId.Value,
                ReviewId = id,
                DeletedAt = DateTime.Now,
                Reason = request.Reason
            };

            // SAVE TRACKING AND SOFT DELETE
            await _context.AdminDeletesRatings.AddAsync(adminAction);
            ratingToDelete.TimestampDeleted = DateTime.Now;
            await _context.SaveChangesAsync();

            return Created(uri: null as string, adminAction);
        }

        [HttpDelete("{ratingId}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> DeleteReviewAsync([FromRoute] ulong ratingId)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User user = (await _context.Users.FindAsync(userId))!;
            bool isAdmin = user.AdminId != null;

            UserRatesSong? rating = await _context.UserRatesSongs
                                           .Include(rating => rating.User)
                                           .FirstOrDefaultAsync(rating => rating.UserRatesSongId == ratingId && rating.TimestampDeleted == null);

            if (rating == null)
                return NotFound("No rating with id " + ratingId + " was found.");

            // Allow if admin OR creator
            if (!isAdmin && rating.UserId != userId)
                return Forbid();

            rating.TimestampDeleted = DateTime.Now;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}