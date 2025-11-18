using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Admin
{
    public class AdminPlaylistSummaryDto
    {
        public int TotalPlaylists { get; set; }
        public int ActivePlaylists { get; set; }
        public int DeletedPlaylists { get; set; }

        public int NewPlaylistsInRange { get; set; }
        public int DeletedPlaylistsInRange { get; set; }
    }
}