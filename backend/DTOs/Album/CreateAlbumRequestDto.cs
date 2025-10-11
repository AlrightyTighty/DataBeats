using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Song;

namespace backend.DTOs.Album
{
    public class CreateAlbumRequestDto
    {
        public string AlbumTitle { get; set; } = null!;

        public string CoverImagePath { get; set; } = null!;

        public int NumSongs { get; set; }

        public string AlbumType { get; set; } = null!;

        public List<CreateSongDto> songs { get; set; } = null!;
    }
}