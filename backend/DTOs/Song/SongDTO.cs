using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Song
{
    public class SongDTO
    {
        public ulong SongId { get; set; }

        public string SongName { get; set; } = null!;

        public string? Lyrics { get; set; }

        public string FilePath { get; set; } = null!;

        public int Streams { get; set; }

        public TimeOnly Duration { get; set; }

        public string ShareLink { get; set; } = null!;

    }
}