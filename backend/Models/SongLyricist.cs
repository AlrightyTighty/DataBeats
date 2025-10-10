using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class SongLyricist
{
    public ulong SongLyricistId { get; set; }

    public ulong SongId { get; set; }

    public string LyricistName { get; set; } = null!;

    public DateTime TimestampCreated { get; set; }

    public ulong CreatedBy { get; set; }

    public DateTime? TimestampUpdated { get; set; }

    public ulong? UpdatedBy { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? DeletedBy { get; set; }

    public virtual Musician CreatedByNavigation { get; set; } = null!;

    public virtual User? DeletedByNavigation { get; set; }

    public virtual Song Song { get; set; } = null!;

    public virtual Musician? UpdatedByNavigation { get; set; }
}
