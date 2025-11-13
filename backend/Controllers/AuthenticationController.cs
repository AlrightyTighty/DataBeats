using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Authentication;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("/api/authentication")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        public AuthenticationController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSessionById([FromRoute] string id)
        {
            Session? session = await _context.Sessions.FindAsync(id);
            if (session == null)
                return NotFound();

            return Ok(session.ToSessionDTO());
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        [Consumes("application/json")]
        public IActionResult Login([FromBody] AuthenticationInformationRequestDto dto)
        {
            User? toLogin;
            List<User> foundUsers = _context.Users.Where(user => user.Username == dto.UsernameOrEmail).ToList();
            if (foundUsers.Count == 0)
            {
                List<AuthenticationInformation> foundAuthInfo = _context.AuthenticationInformations.Where(authInfo => authInfo.Email == dto.UsernameOrEmail).Include(authInfo => authInfo.User).ToList();
                if (foundAuthInfo.Count == 0)
                    return Unauthorized("Invalid login info.");
                toLogin = foundAuthInfo[0].User;
            }
            else
                toLogin = foundUsers[0];

            if (toLogin == null)
                return Unauthorized("Invalid login info.");
//delete
            var authInfo = _context.AuthenticationInformations
            .FirstOrDefault(a => a.UserId == toLogin.UserId);

            if (authInfo == null)
                return Unauthorized("Invalid login info.");

            if (authInfo.Locked)
            {
                return Unauthorized("Account is disabled.");
            }

            Session newSession = new Session
            {
                SessionId = Guid.NewGuid().ToString(),
                IssuedAt = DateTime.Now,
                ExperationTime = DateTime.Now.AddDays(30),
                Revoked = false,
                UserId = toLogin.UserId,
                User = toLogin
            };

            toLogin.Sessions.Add(newSession);

            _context.Sessions.Add(newSession);
            _context.SaveChanges();

            Response.Cookies.Append("session-id", newSession.SessionId, new CookieOptions { HttpOnly = true, Expires = DateTime.Now.AddDays(30), SameSite = SameSiteMode.None, Secure=true});

            return CreatedAtAction(nameof(GetSessionById), new { id = newSession.SessionId }, newSession.ToSessionDTO());
        }
    }
}