using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Playlist
{
    public class CreatePlaylistDto
    {
        public string PlaylistName { get; set; } = null!;

        public string? PlaylistPic { get; set; }

        public string? PlaylistDescription { get; set; }
        public string? Access { get; set; }

        public ulong UserId { get; set; } //lets backend know which user playlist belongs to
    }
}