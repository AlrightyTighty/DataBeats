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
}