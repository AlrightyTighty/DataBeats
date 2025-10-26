using System;
using System.Collections.Generic;
using System.Linq;
using backend.DTOs.Song;
using System.Threading.Tasks;

namespace backend.DTOs.Playlist
{
    public class PlaylistDto
    {
        public ulong PlaylistId { get; set; }
        public string PlaylistName { get; set; } = null!;

        public string? PlaylistPic { get; set; } = null!;

        public string? PlaylistDescription { get; set; }
        public int NumOfSongs { get; set; }
        public TimeOnly Duration { get; set; }
        public string Access { get; set; } = null!;
        public ulong? UserId { get; set; }
        public List<SongDto>? Songs { get; set; }
    }
}