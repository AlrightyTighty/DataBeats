using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using backend.DTOs.Admin;
using backend.DTOs.Authentication;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            {
                var existingUser = await _context.Users.AnyAsync(u => u.Username == dto.Username && u.UserId != id);
                if (existingUser) return Conflict("Username taken.");

                user.Username = dto.Username;
            }

            if (!string.IsNullOrWhiteSpace(dto.Fname))
                user.Fname = dto.Fname;

            if (!string.IsNullOrWhiteSpace(dto.Lname))
                user.Lname = dto.Lname;

            if (dto.ProfilePictureFileId.HasValue)
                user.ProfilePictureFileId = dto.ProfilePictureFileId.Value;

            await _context.SaveChangesAsync();

            return Ok(user.ToUserDtoFromUser());
        }

        [HttpPatch("password/{id}")]
        public async Task<IActionResult> UpdateAuth([FromRoute] ulong id, [FromBody] UpdateAuthDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.OldPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { message = "Both old and new passwords are required." });

            var user = await _context.Users
                .Include(u => u.AuthenticationInformation)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null || user.AuthenticationInformation == null)
                return NotFound("User or authentication info could not be found.");

            if (user.AuthenticationInformation.Password != dto.OldPassword)
                return BadRequest("Old password incorrect.");
            
            string passwordPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$";
            if (!Regex.IsMatch(dto.NewPassword, passwordPattern))
                return BadRequest("Password requirements not met.");
            user.AuthenticationInformation.Password = dto.NewPassword;

            await _context.SaveChangesAsync();
            return Ok("Password successfully updated.");
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
            DateTime now = DateTime.UtcNow;

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

            // CASCADE SOFT DELETE USER'S CONTENT

            // Soft delete musician if exists
            if (userToDelete.MusicianId != null)
            {
                var musician = await _context.Musicians.FindAsync(userToDelete.MusicianId.Value);
                if (musician != null && musician.TimestampDeleted == null)
                {
                    musician.TimestampDeleted = now;
                    musician.DeletedBy = userId;
                }
            }

            // Soft delete all songs created by the user's musician
            if (userToDelete.MusicianId != null)
            {
                var songs = await _context.Songs
                    .Where(s => s.CreatedBy == userToDelete.MusicianId.Value && s.TimestampDeleted == null)
                    .ToListAsync();

                foreach (var song in songs)
                {
                    song.TimestampDeleted = now;
                    song.DeletedBy = userId;
                }
            }

            // Soft delete all events created by the user's musician
            if (userToDelete.MusicianId != null)
            {
                var events = await _context.Events
                    .Where(e => e.MusicianId == userToDelete.MusicianId.Value && e.TimestampDeleted == null)
                    .ToListAsync();

                foreach (var evt in events)
                {
                    evt.TimestampDeleted = now;
                    evt.DeletedBy = userId;
                }
            }

            // Soft delete all reviews created by the user
            var reviews = await _context.Reviews
                .Where(r => r.CreatedBy == id && r.TimestampDelted == null)
                .ToListAsync();

            foreach (var review in reviews)
            {
                review.TimestampDelted = now;
                review.DeletedBy = userId;
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
            userToDelete.TimeDeleted = now;

            await _context.SaveChangesAsync();

            return Ok();
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

            DateTime now = DateTime.UtcNow;

            // CASCADE SOFT DELETE USER'S CONTENT

            // Soft delete musician if exists
            if (user.MusicianId != null)
            {
                var musician = await _context.Musicians.FindAsync(user.MusicianId.Value);
                if (musician != null && musician.TimestampDeleted == null)
                {
                    musician.TimestampDeleted = now;
                    musician.DeletedBy = userId;
                }
            }

            // Soft delete all songs created by the user's musician
            if (user.MusicianId != null)
            {
                var songs = await _context.Songs
                    .Where(s => s.CreatedBy == user.MusicianId.Value && s.TimestampDeleted == null)
                    .ToListAsync();

                foreach (var song in songs)
                {
                    song.TimestampDeleted = now;
                    song.DeletedBy = userId;
                }
            }

            // Soft delete all events created by the user's musician
            if (user.MusicianId != null)
            {
                var events = await _context.Events
                    .Where(e => e.MusicianId == user.MusicianId.Value && e.TimestampDeleted == null)
                    .ToListAsync();

                foreach (var evt in events)
                {
                    evt.TimestampDeleted = now;
                    evt.DeletedBy = userId;
                }
            }

            // Soft delete all reviews created by the user
            var reviews = await _context.Reviews
                .Where(r => r.CreatedBy == id && r.TimestampDelted == null)
                .ToListAsync();

            foreach (var review in reviews)
            {
                review.TimestampDelted = now;
                review.DeletedBy = userId;
            }

            user.AuthenticationInformation.Locked = true;
            user.AuthenticationInformation.LockExpiration = DateTime.UtcNow.AddDays(100);

            // mark user as deleted for reporting
            user.TimeDeleted = now;

            await _context.SaveChangesAsync();
            return NoContent();
        }


    }
}