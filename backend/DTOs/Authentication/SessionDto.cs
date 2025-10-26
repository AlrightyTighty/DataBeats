using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Authentication
{
    public class SessionDto
    {
        public string SessionId { get; set; } = null!;
        public DateTime IssuedAt { get; set; }
        public DateTime ExperationTime { get; set; }
        public bool Revoked { get; set; }
    }
}