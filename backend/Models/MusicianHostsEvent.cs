using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class MusicianHostsEvent
{
    public ulong MusicianHostsEventId { get; set; }

    public ulong EventId { get; set; }

    public ulong MusicianId { get; set; }

    public DateTime TimestampCreated { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual Musician Musician { get; set; } = null!;
}
