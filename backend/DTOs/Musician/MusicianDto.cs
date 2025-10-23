using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Musician
{
    public class MusicianDto
    {
        public ulong MusicianId { get; set; }

        public ulong UserId { get; set; }

        public string MusicianName { get; set; } = null!;

        public string? Bio { get; set; }

        public string? Label { get; set; }

        public int FollowerCount { get; set; }

        public ulong ProfilePictureFileId { get; set; }

    }
}