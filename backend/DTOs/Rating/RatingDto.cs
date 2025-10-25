using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Rating
{
    public class RatingDto
    {
        public ulong UserRatesSongId { get; set; }
        public ulong UserId { get; set; }
        public ulong SongId { get; set; }
        public byte StarCount { get; set; }
        public string? Comment { get; set; }
        public string Username { get; set; } = null!;
    }
}