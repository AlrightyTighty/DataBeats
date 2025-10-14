using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Session
{
    public string SessionId { get; set; } = null!;

    public ulong UserId { get; set; }

    public DateTime IssuedAt { get; set; }

    public DateTime ExperationTime { get; set; }

    public bool Revoked { get; set; }

    public virtual User User { get; set; } = null!;
}
