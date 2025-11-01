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

        public ArtistInfo[] Artists { get; set; } = null!;

        public byte[]? AlbumArtImage { get; set; }
    }

    public class ArtistInfo
    {
        public string ArtistName { get; set; } = null!;
        public ulong MusicianId { get; set; }
    }
}