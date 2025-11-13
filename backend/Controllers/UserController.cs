using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
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
            return CreatedAtAction(nameof(GetById), new { id = newUser.UserId }, newUser.ToUserDtoFromUser());
        }

        // SOFT DELETE: lock account "forever" so user can't log in anymore
        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteUser([FromRoute] ulong id)
        {
            var user = await _context.Users
                .Include(u => u.AuthenticationInformation)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound();

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