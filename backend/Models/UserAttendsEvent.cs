using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserAttendsEvent
{
    public ulong UserAttendsEventsId { get; set; }

    public ulong UserId { get; set; }

    public ulong EventId { get; set; }

    public DateTime TimeRspv { get; set; }

    public DateTime? TimeUnrspv { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
