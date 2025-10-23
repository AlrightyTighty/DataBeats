using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Song
{
    public class CreateSongDto
    {
        public string SongName { get; set; } = null!;

        public string? Lyrics { get; set; }

        public ulong SongFileId { get; set; }
    }
}