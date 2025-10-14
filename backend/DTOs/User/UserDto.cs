using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.User
{
    public class UserDto
    {
        public string Username { get; set; } = null!;
        public string? Fname { get; set; }
        public string? Lname { get; set; } = null!;
        public string? ProfilePic { get; set; } = null!;
        public ulong? AdminId { get; set; }
        public ulong? MusicianId { get; set; }
    }
}