using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("/api/authtest")]
    [ApiController]
    public class AuthenticationTest : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        public AuthenticationTest(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAccountInfo()
        {
            string? userIdString = Request.Headers["X-UserId"];
            if (userIdString == null)
                return BadRequest("Something must've gone REALLY wrong for you to get here.");

            ulong userId = ulong.Parse(userIdString);
            User? user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("Your session ID doesn't match any user somehow");

            return Ok(user.ToUserDtoFromUser());
        }

    }
}