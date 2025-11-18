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
    
    public class AdminSongRowDto
    {
        public ulong SongId { get; set; }
        public string SongName { get; set; } = "";
        public ulong AlbumId { get; set; }
        public ulong CreatedBy { get; set; }
        public DateTime? TimestampCreated { get; set; }
        public DateTime? TimestampDeleted { get; set; }
        public int Streams { get; set; }
        public bool IsDeleted { get; set; }
    }
}