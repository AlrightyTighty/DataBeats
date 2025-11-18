using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using backend.DTOs.Admin;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft. EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        private const string LikedPlaylistName = "Your Liked Playlist";
        private const ulong DefaultPlaylistPictureFileId = 31; //should be changed later after we have a proper default image
        public UserController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public IActionResult GetById([FromRoute] ulong id)
        {
            User? user = _context.Users.Find(id);

            if (user == null)
                return NotFound();

            return Ok(user.ToUserDtoFromUser());
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] CreateUserRequestDto dto)
        {
            string username = dto.Username;
            string password = dto.Password;
            string email = dto.Email;
            if (username.Length == 0 || username.Length > 20)
                return BadRequest("Invalid Username");

            string passwordPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$";

            if (!Regex.IsMatch(password, passwordPattern))
                return BadRequest("Invalid Password");

            string emailPattern = @"^(?=.{1,100}$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$";

            if (!Regex.IsMatch(email, emailPattern))
                return BadRequest("Invalid Email");

            User newUser = dto.ToUserFromCreateUserDto();
            newUser.AuthenticationInformation = dto.ToAuthenticationInformationFromCreateUserDto();
            newUser.AuthenticationInformation.User = newUser;

            _context.Users.Add(newUser);
            _context.SaveChanges();

            var likedPlaylist = new Playlist
            {
                UserId = newUser.UserId,
                PlaylistName = LikedPlaylistName,
                PlaylistDescription = "A playlist that contains all of your liked songs.",
                Access = "public",
                NumOfSongs = 0,
                TimestampCreated = DateTime.Now,
                Duration = new TimeOnly(0, 0),
                PlaylistPictureFileId = DefaultPlaylistPictureFileId

            };

            _context.Playlists.Add(likedPlaylist);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { id = newUser.UserId }, newUser.ToUserDtoFromUser());
        }
        
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateUser([FromRoute] ulong id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Username))
                user.Username = dto.Username;

            if (!string.IsNullOrWhiteSpace(dto.Fname))
                user.Fname = dto.Fname;

            if (!string.IsNullOrWhiteSpace(dto.Lname))
                user.Lname = dto.Lname;

            if (dto.ProfilePictureFileId.HasValue)
                user.ProfilePictureFileId = dto.ProfilePictureFileId.Value;

            await _context.SaveChangesAsync();

            return Ok(user.ToUserDtoFromUser());
        }

        [HttpPost("/admin/delete/user/{id}")]
        public async Task<IActionResult> AdminDeleteByIdAsync([FromRoute] ulong id, [FromBody] AdminDeleteRequest request)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User deletingUser = (await _context.Users.FindAsync(userId))!;
            User? userToDelete = await _context.Users
                .Include(u => u.AuthenticationInformation)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (userToDelete == null)
                return NotFound();

            // ADMIN CHECK
            if (deletingUser.AdminId == null)
                return StatusCode(StatusCodes.Status403Forbidden);

            if (userToDelete.AuthenticationInformation == null)
                return BadRequest("No authentication record for this user.");

            ulong? adminId = deletingUser.AdminId;
            DateTime lockExpiration = DateTime.UtcNow.AddDays(100);

            // RESOLVE ASSOCIATED REPORTS IF REQUESTED
            if (request.ResolveReports)
            {
                var unresolvedComplaints = await _context.Complaints
                    .Include(c => c.Reviews)
                    .Where(c => c.ComplaintType == "USER" && c.ComplaintTargetId == id && c.Reviews.Count == 0)
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
            AdminManagesUser adminAction = new AdminManagesUser
            {
                AdminId = adminId.Value,
                UserId = id,
                Reason = request.Reason,
                EndsAt = lockExpiration,
                CreatedAt = DateTime.Now,
                CreatedBy = adminId.Value
            };

            // SAVE TRACKING AND LOCK ACCOUNT
            await _context.AdminManagesUsers.AddAsync(adminAction);
            userToDelete.AuthenticationInformation.Locked = true;
            userToDelete.AuthenticationInformation.LockExpiration = lockExpiration;
            await _context.SaveChangesAsync();

            return Created(uri: null as string, adminAction);
        }

        // SOFT DELETE: lock account "forever" so user can't log in anymore
        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteUser([FromRoute] ulong id)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User requestingUser = (await _context.Users.FindAsync(userId))!;
            bool isAdmin = requestingUser.AdminId != null;

            var user = await _context.Users
                .Include(u => u.AuthenticationInformation)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound();

            // Allow if admin OR deleting own account
            if (!isAdmin && userId != id)
                return StatusCode(StatusCodes.Status403Forbidden);

            if (user.AuthenticationInformation == null)
                return BadRequest("No authentication record for this user.");

            user.AuthenticationInformation.Locked = true;
            // effectively permanent
            user.AuthenticationInformation.LockExpiration = DateTime.UtcNow.AddDays(100);

            await _context.SaveChangesAsync();
            return NoContent();
        }


    }
}