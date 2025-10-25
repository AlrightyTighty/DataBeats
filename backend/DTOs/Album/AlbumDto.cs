using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Album
{
    public class AlbumDto
    {
        public ulong AlbumId { get; set; }

        public string AlbumTitle { get; set; } = null!;

        public DateTime ReleaseDate { get; set; }

        public int NumSongs { get; set; }

        public TimeOnly Duration { get; set; }

        public string AlbumType { get; set; } = null!;
    }
}