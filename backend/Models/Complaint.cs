using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Complaint
{
    public ulong ComplaintId { get; set; }

    public string UserComment { get; set; } = null!;

    public string ComplaintType { get; set; } = null!;

    public ulong ComplaintTargetId { get; set; }

    public DateTime TimeCreated { get; set; }

    public DateTime? TimeDeleted { get; set; }

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<UserMakesComplaint> UserMakesComplaints { get; set; } = new List<UserMakesComplaint>();
}
