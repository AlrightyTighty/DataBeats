using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        [HttpDelete("{ratingId}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> DeleteReviewAsync([FromRoute] ulong ratingId)
        {
            Console.WriteLine("Deleting Rating!");

            UserRatesSong? rating = await _context.UserRatesSongs
                                           .Include(rating => rating.User)
                                           .FirstOrDefaultAsync(rating => rating.UserRatesSongId == ratingId && rating.TimestampDeleted == null);

            if (rating == null)
                return NotFound("No rating with id " + ratingId + " was found.");

            if (rating.UserId != ulong.Parse(Request.Headers["X-UserId"]!))
                return Forbid();

            rating.TimestampDeleted = DateTime.Now;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}