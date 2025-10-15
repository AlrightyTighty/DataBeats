using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
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
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetAccountInfo()
        {
            string? userIdString = Request.Headers["X-UserId"];
            if (userIdString == null)
                return Unauthorized();

            ulong userId = ulong.Parse(userIdString);
            User? user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("Your session ID doesn't match any user somehow");

            return Ok(user.ToUserDtoFromUser());
        }

    }
}