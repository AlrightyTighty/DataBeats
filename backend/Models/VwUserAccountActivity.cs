using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class VwUserAccountActivity
{
    public ulong UserId { get; set; }

    public string Username { get; set; } = null!;

    public DateTime? TimeCreated { get; set; }

    public DateTime? TimeDeleted { get; set; }

    public int IsDeleted { get; set; }
}
