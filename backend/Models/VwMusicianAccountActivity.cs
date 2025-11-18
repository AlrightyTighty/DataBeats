using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class VwMusicianAccountActivity
{
    public ulong MusicianId { get; set; }

    public ulong UserId { get; set; }

    public string MusicianName { get; set; } = null!;

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public int FollowerCount { get; set; }

    public int MonthlyListenerCount { get; set; }

    public int IsDeleted { get; set; }
}
