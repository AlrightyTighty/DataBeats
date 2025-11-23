using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Admin
{
    public class AdminEventSummaryDto
    {
        public int TotalEvents { get; set; }
        public int ActiveEvents { get; set; }
        public int DeletedEvents { get; set; }

        public int NewEventsInRange { get; set; }
        public int DeletedEventsInRange { get; set; }
    }

    public class AdminEventRowDto
    {
        public string Title { get; set; } = "";
        public string MusicianName { get; set; } = "";
        public DateTime? TimestampCreated { get; set; }
        public DateTime? TimestampDeleted { get; set; }
        public DateTime? EventTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}