using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class AuthenticationInformation
{
    public ulong AuthenticationInformationId { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int LoginAttempts { get; set; }

    public bool Locked { get; set; }

    public DateTime? LockExpiration { get; set; }

    public ulong? UserId { get; set; }

    public virtual User? User { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
