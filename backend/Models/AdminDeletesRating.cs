using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class AdminDeletesRating
{
    public ulong AdminManagesRatingId { get; set; }

    public ulong AdminId { get; set; }

    public ulong ReviewId { get; set; }

    public string Reason { get; set; } = null!;

    public DateTime? DeletedAt { get; set; }

    public ulong? DeletedBy { get; set; }

    public ulong? UpdatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Admin Admin { get; set; } = null!;

    public virtual Admin? DeletedByNavigation { get; set; }

    public virtual Review Review { get; set; } = null!;

    public virtual Admin? UpdatedByNavigation { get; set; }
}
