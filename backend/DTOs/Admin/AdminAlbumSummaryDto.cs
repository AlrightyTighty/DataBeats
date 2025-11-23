using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Admin
{
    public class AdminAlbumSummaryDto
    {
        public int TotalAlbums { get; set; }
        public int ActiveAlbums { get; set; }
        public int DeletedAlbums { get; set; }
        public int NewAlbumsInRange { get; set; }
        public int DeletedAlbumsInRange { get; set; }
    }

    public class AdminAlbumRowDto
    {
        public string AlbumTitle { get; set; } = "";
        public string MusicianName { get; set; } = "";
        public DateTime? TimestampCreated { get; set; }
        public DateTime? TimestampDeleted { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public int NumSongs { get; set; }
        public bool IsDeleted { get; set; }
    }
}