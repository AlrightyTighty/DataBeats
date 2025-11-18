using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Review
{
    public ulong ReviewId { get; set; }

    public ulong? AdminId { get; set; }

    public ulong? ComplaintId { get; set; }

    public DateTime TimestampCreated { get; set; }

    public ulong CreatedBy { get; set; }

    public DateTime? TimestampUpdated { get; set; }

    public ulong? UpdatedBy { get; set; }

    public DateTime? TimestampDelted { get; set; }

    public ulong? DeletedBy { get; set; }

    public string ReviewComment { get; set; } = null!;

    public virtual Admin? Admin { get; set; }

    public virtual ICollection<AdminDeletesRating> AdminDeletesRatings { get; set; } = new List<AdminDeletesRating>();

    public virtual Complaint? Complaint { get; set; }

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual User? DeletedByNavigation { get; set; }
}
