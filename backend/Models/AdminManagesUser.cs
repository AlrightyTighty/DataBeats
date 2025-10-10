using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class AdminManagesUser
{
    public ulong AdminManagesUserId { get; set; }

    public ulong AdminId { get; set; }

    public ulong UserId { get; set; }

    public string Reason { get; set; } = null!;

    public DateTime EndsAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public ulong? CreatedBy { get; set; }

    public DateTime? RevokedAt { get; set; }

    public ulong? RevokedBy { get; set; }

    public virtual Admin Admin { get; set; } = null!;

    public virtual Admin? CreatedByNavigation { get; set; }

    public virtual Admin? RevokedByNavigation { get; set; }

    public virtual User User { get; set; } = null!;
}
