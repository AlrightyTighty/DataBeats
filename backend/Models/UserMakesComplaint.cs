using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserMakesComplaint
{
    public ulong UserMakesComplaintId { get; set; }

    public ulong ComplaintId { get; set; }

    public ulong UserId { get; set; }

    public DateTime TimestampMade { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public virtual Complaint Complaint { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
