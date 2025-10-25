using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Playlist
{
    public class UpdatePlaylistDto
    {
        public string PlaylistName { get; set; } = null!;

        public string? PlaylistPic { get; set; } = null!;

        public string? PlaylistDescription { get; set; }
        public string Access { get; set; } = null!;

        public ulong UserId { get; set; } //lets backend know which user playlist belongs to
    }
}