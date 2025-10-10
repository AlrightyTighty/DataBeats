using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class AdminDeletesMusician
{
    public ulong AdminDeletesMusicianId { get; set; }

    public ulong AdminId { get; set; }

    public ulong MusicianId { get; set; }

    public string Reason { get; set; } = null!;

    public DateTime? DeletedAt { get; set; }

    public ulong? DeletedBy { get; set; }

    public ulong? UpdatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Admin Admin { get; set; } = null!;

    public virtual Admin? DeletedByNavigation { get; set; }

    public virtual Musician Musician { get; set; } = null!;

    public virtual Admin? UpdatedByNavigation { get; set; }
}
