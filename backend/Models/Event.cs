using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Event
{
    public ulong EventId { get; set; }

    public ulong MusicianId { get; set; }

    public string Title { get; set; } = null!;

    public string EventDescription { get; set; } = null!;

    public string EventPic { get; set; } = null!;

    public DateTime EventTime { get; set; }

    public decimal TicketPrice { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? DeletedBy { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual Musician Musician { get; set; } = null!;

    public virtual ICollection<UserAttendsEvent> UserAttendsEvents { get; set; } = new List<UserAttendsEvent>();
}
