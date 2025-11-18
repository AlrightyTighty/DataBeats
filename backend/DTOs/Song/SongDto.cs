using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Song
{
    public class SongDto
    {
        public ulong SongId { get; set; }

        public string SongName { get; set; } = null!;

        public string? Lyrics { get; set; }

        public ulong? SongFileId { get; set; }

        public int Streams { get; set; }

        public TimeOnly Duration { get; set; }

        public string ShareLink { get; set; } = null!;

        public ulong AlbumId { get; set; }

        public string AlbumName { get; set; } = null!;

        public ulong AlbumArtId { get; set; }

        public string[] ArtistNames { get; set; } = null!;

        public ulong[] ArtistIds { get; set; } = null!;

        public ulong CreatorId { get; set; }

        public string[] Genres { get; set; } = null!;

    }
}