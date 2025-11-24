using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class AdminDeletesEvent
{
    public ulong AdminDeletesEventId { get; set; }

    public ulong AdminId { get; set; }

    public ulong EventId { get; set; }

    public string Reason { get; set; } = null!;

    public DateTime DeletedAt { get; set; }

    public ulong DeletedBy { get; set; }

    public virtual Admin Admin { get; set; } = null!;

    public virtual Admin DeletedByNavigation { get; set; } = null!;

    public virtual Event Event { get; set; } = null!;
}
