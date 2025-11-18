using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Musician
{
    public class CreateMusicianDto
    {
        public ulong UserId { get; set; }
        public string MusicianName { get; set; } = null!;

        public string Bio { get; set; } = null!;

        public ulong ProfilePictureFileId { get; set; }
        public string Label { get; set; } = null!;
        
    }
}