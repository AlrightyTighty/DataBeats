using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Rating
{
    public class CreateRatingDto
    {
        public ulong SongId { get; set; }
        public byte StarCount { get; set; }
        public string Comment { get; set; } = null!;

        
    }
}