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
            User user = _context.Users.Find(id);

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
            return CreatedAtAction(nameof(GetById), new {id = newUser.UserId}, newUser.ToUserDtoFromUser());
        }
    }
}