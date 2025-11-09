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

        public ulong AlbumOrSongArtFileId { get; set; }

        public string[] MusicianNames { get; set; } = null!;

        public string[][] MusicianNamesPerSong { get; set; } = null!;

        public ulong[]? MusicianIds { get; set; } = null!;

        public ulong[][]? MusicianIdsPerSong { get; set; } = null!;

        public string[][] GenresPerSong { get; set; } = null!;

        public List<CreateSongDto> Songs { get; set; } = null!;

    }
}