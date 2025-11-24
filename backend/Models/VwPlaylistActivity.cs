using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class VwPlaylistActivity
{
    public ulong PlaylistId { get; set; }

    public string PlaylistName { get; set; } = null!;

    public ulong UserId { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public int IsDeleted { get; set; }
}
