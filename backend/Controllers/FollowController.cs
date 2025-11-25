using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/follow")]
    [ApiController]
    public class FollowController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public FollowController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost("{followerId}/{followeeId}")]
        public async Task<IActionResult> Follow([FromRoute] ulong followerId, [FromRoute] ulong followeeId)
        {
            if (followerId == followeeId)
                return BadRequest("You cannot follow yourself.");

            var follower = await _context.Users.FindAsync(followerId);
            var followee = await _context.Users.FindAsync(followeeId);

            if (follower == null || followee == null)
                return NotFound("User not found.");

            var now = DateTime.UtcNow;

            var follow = await _context.UserFollowsUsers
                .FirstOrDefaultAsync(f => f.Follower == followerId && f.Followee == followeeId);

            if (follow == null)
            {
                follow = new UserFollowsUser
                {
                    Follower = followerId,
                    Followee = followeeId,
                    TimeFollowed = now,
                    TimeUnfollowed = null
                };
                await _context.UserFollowsUsers.AddAsync(follow);
            }
            else if (follow.TimeUnfollowed != null)
            {
                follow.TimeUnfollowed = null;
                follow.TimeFollowed = now;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{followerId}/{followeeId}")]
        public async Task<IActionResult> Unfollow([FromRoute] ulong followerId, [FromRoute] ulong followeeId)
        {
            var follow = await _context.UserFollowsUsers
                .FirstOrDefaultAsync(f =>
                    f.Follower == followerId &&
                    f.Followee == followeeId &&
                    f.TimeUnfollowed == null);

            if (follow == null)
                return NotFound("Follow relation not found.");

            follow.TimeUnfollowed = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("is-following/{followerId}/{followeeId}")]
        public async Task<IActionResult> IsFollowing([FromRoute] ulong followerId, [FromRoute] ulong followeeId)
        {
            var isFollowing = await _context.UserFollowsUsers
                .AnyAsync(f =>
                    f.Follower == followerId &&
                    f.Followee == followeeId &&
                    f.TimeUnfollowed == null);

            return Ok(new { isFollowing });
        }

        [HttpGet("are-friends/{userId1}/{userId2}")]
        public async Task<IActionResult> AreFriends([FromRoute] ulong userId1, [FromRoute] ulong userId2)
        {
            // Check if both users are following each other (mutual follow = friends)
            var user1FollowsUser2 = await _context.UserFollowsUsers
                .AnyAsync(f => 
                    f.Follower == userId1 && 
                    f.Followee == userId2 && 
                    f.TimeUnfollowed == null);

            var user2FollowsUser1 = await _context.UserFollowsUsers
                .AnyAsync(f => 
                    f.Follower == userId2 && 
                    f.Followee == userId1 && 
                    f.TimeUnfollowed == null);

            var areFriends = user1FollowsUser2 && user2FollowsUser1;

            return Ok(new { areFriends });
        }

        [HttpGet("followers/{userId}")]
        public async Task<IActionResult> GetFollowers([FromRoute] ulong userId)
        {
            var followers = await _context.UserFollowsUsers
                .Include(f => f.FollowerNavigation)
                .ThenInclude(u => u.Musicians)
                .Where(f => f.Followee == userId && f.TimeUnfollowed == null)
                .ToListAsync();

            // Get all follower user IDs
            var followerIds = followers.Select(f => f.FollowerNavigation.UserId).ToList();

            // Check mutual follows in a single query
            var mutualFollows = await _context.UserFollowsUsers
                .Where(f => 
                    f.Follower == userId && 
                    followerIds.Contains(f.Followee) && 
                    f.TimeUnfollowed == null)
                .Select(f => f.Followee)
                .ToListAsync();

            var mutualFollowSet = new HashSet<ulong>(mutualFollows);

            var result = followers.Select(f =>
            {
                var user = f.FollowerNavigation;
                var musician = user.Musicians.FirstOrDefault();

                return new
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Fname = user.Fname,
                    Lname = user.Lname,
                    HasMusicianProfile = musician != null,
                    MusicianId = musician != null ? musician.MusicianId : (ulong?)null,
                    MusicianName = musician != null ? musician.MusicianName : null,
                    f.TimeFollowed,
                    IsFriend = mutualFollowSet.Contains(user.UserId)
                };
            });

            return Ok(result);
        }

        [HttpGet("following/{userId}")]
        public async Task<IActionResult> GetFollowing([FromRoute] ulong userId)
        {
            var following = await _context.UserFollowsUsers
                .Include(f => f.FolloweeNavigation)
                .ThenInclude(u => u.Musicians)
                .Where(f => f.Follower == userId && f.TimeUnfollowed == null)
                .ToListAsync();

            // Get all followee user IDs
            var followeeIds = following.Select(f => f.FolloweeNavigation.UserId).ToList();

            // Check mutual follows in a single query
            var mutualFollows = await _context.UserFollowsUsers
                .Where(f => 
                    followeeIds.Contains(f.Follower) && 
                    f.Followee == userId && 
                    f.TimeUnfollowed == null)
                .Select(f => f.Follower)
                .ToListAsync();

            var mutualFollowSet = new HashSet<ulong>(mutualFollows);

            var result = following.Select(f =>
            {
                var user = f.FolloweeNavigation;
                var musician = user.Musicians.FirstOrDefault();

                return new
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Fname = user.Fname,
                    Lname = user.Lname,
                    HasMusicianProfile = musician != null,
                    MusicianId = musician != null ? musician.MusicianId : (ulong?)null,
                    MusicianName = musician != null ? musician.MusicianName : null,
                    f.TimeFollowed,
                    IsFriend = mutualFollowSet.Contains(user.UserId)
                };
            });

            return Ok(result);
        }
    }
}