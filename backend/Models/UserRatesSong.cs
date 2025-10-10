using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserRatesSong
{
    public ulong UserRatesSongId { get; set; }

    public ulong UserId { get; set; }

    public ulong SongId { get; set; }

    public string Stars { get; set; } = null!;

    public string? Comment { get; set; }

    public DateTime? CommentTimestampCreated { get; set; }

    public DateTime? CommentTimestampUpdated { get; set; }

    public DateTime? CommentTimestampDeleted { get; set; }

    public ulong? CommentDeletedBy { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampUpdated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? DeletedBy { get; set; }

    public virtual User? CommentDeletedByNavigation { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual Song Song { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
