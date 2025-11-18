using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Admin
{
    public class AdminSongSummaryDto
    {
        public int TotalSongs { get; set; }
        public int ActiveSongs { get; set; }
        public int DeletedSongs { get; set; }

        public int NewSongsInRange { get; set; }
        public int DeletedSongsInRange { get; set; }
    }
}