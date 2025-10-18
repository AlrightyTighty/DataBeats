using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Event
{
    public class EventDto
    {
        public ulong EventId { get; set; }
        public string Title { get; set; } = null!;

        public string EventDescription { get; set; } = null!;

        public string EventPic { get; set; } = null!;
        public DateTime EventTime { get; set; }

        public decimal TicketPrice { get; set; }
        public ulong MusicianId { get; set; }

    }
}