using System;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Friend;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/friend")]
    [ApiController]
    public class FriendController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public FriendController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SendFriendRequest([FromBody] CreateFriendRequestDto dto)
        {
            if (dto.FrienderId == dto.FriendeeId)
                return BadRequest("You cannot friend yourself.");

            var existing = await _context.UserFriendsWithUsers
                .FirstOrDefaultAsync(f => 
                    (f.FrienderId == dto.FrienderId && f.FriendeeId == dto.FriendeeId) ||
                    (f.FrienderId == dto.FriendeeId && f.FriendeeId == dto.FrienderId));

            if (existing != null)
                return BadRequest("Friend request or friendship already exists.");

            var newFriend = dto.ToUserFriendsWithUser();
            await _context.UserFriendsWithUsers.AddAsync(newFriend);
            await _context.SaveChangesAsync();

            return Ok(newFriend.ToFriendDto());
        }

        [HttpPatch("accept/{id}")]
        public async Task<IActionResult> AcceptFriendRequest([FromRoute] ulong id)
        {
            var request = await _context.UserFriendsWithUsers.FindAsync(id);
            if (request == null)
                return NotFound("Friend request not found.");

            if (request.FriendedState == "Accepted")
                return BadRequest("Already accepted.");

            request.FriendedState = "Accepted";
            request.TimeAccepted = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(request.ToFriendDto());
        }

        [HttpDelete("{frienderId}/{friendeeId}")]
        public async Task<IActionResult> Unfriend([FromRoute] ulong frienderId, [FromRoute] ulong friendeeId)
        {
            var friend = await _context.UserFriendsWithUsers
                .FirstOrDefaultAsync(f =>
                    (f.FrienderId == frienderId && f.FriendeeId == friendeeId) ||
                    (f.FrienderId == friendeeId && f.FriendeeId == frienderId));

            if (friend == null)
                return NotFound("Friendship not found.");

            friend.TimeUnfriended = DateTime.UtcNow;
            friend.FriendedState = "Removed";
            await _context.SaveChangesAsync();

            return Ok("Unfriended successfully.");
        }

        [HttpGet("friends/{userId}")]
        public async Task<IActionResult> GetFriends([FromRoute] ulong userId)
        {
            var friends = await _context.UserFriendsWithUsers
                .Include(f => f.Friendee)
                .Include(f => f.Friender)
                .Where(f => 
                    (f.FrienderId == userId || f.FriendeeId == userId) && 
                    f.FriendedState == "Accepted")
                .ToListAsync();

            var result = friends.Select(f => new
            {
                f.FriendsWithId,
                FriendId = f.FrienderId == userId ? f.FriendeeId : f.FrienderId,
                Username = f.FrienderId == userId ? f.Friendee.Username : f.Friender.Username,
                f.TimeFriended,
                f.TimeAccepted
            });

            return Ok(result);
        }

        [HttpGet("pending/{userId}")]
        public async Task<IActionResult> GetPendingRequests([FromRoute] ulong userId)
        {
            var pending = await _context.UserFriendsWithUsers
                .Include(f => f.Friender)
                .Where(f => f.FriendeeId == userId && f.FriendedState == "Pending")
                .ToListAsync();

            var result = pending.Select(f => new
            {
                f.FriendsWithId,
                FrienderId = f.FrienderId,
                FrienderName = f.Friender.Username,
                f.TimeFriended
            });

            return Ok(result);
        }
    }
}
