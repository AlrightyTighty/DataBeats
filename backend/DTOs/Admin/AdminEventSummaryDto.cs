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
}