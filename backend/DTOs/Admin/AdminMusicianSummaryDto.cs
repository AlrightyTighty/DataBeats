using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Admin
{
    public class AdminMusicianSummaryDto
    {
        public int TotalMusicians { get; set; }
        public int ActiveMusicians { get; set; }
        public int DeletedMusicians { get; set; }

        public int NewMusiciansInRange { get; set; }
        public int DeletedMusiciansInRange { get; set; }
    }

    public class AdminMusicianRowDto
    {
        public ulong MusicianId { get; set; }
        public ulong UserId { get; set; }
        public string MusicianName { get; set; } = "";
        public DateTime? TimestampCreated { get; set; }
        public DateTime? TimestampDeleted { get; set; }
        public int FollowerCount { get; set; }
        public int MonthlyListenerCount { get; set; }
        public bool IsDeleted { get; set; }
    }
}