using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class VwEventActivity
{
    public ulong EventId { get; set; }

    public string Title { get; set; } = null!;

    public ulong MusicianId { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public DateTime EventTime { get; set; }

    public int IsDeleted { get; set; }
}
