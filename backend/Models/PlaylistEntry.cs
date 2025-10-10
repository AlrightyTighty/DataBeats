using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class PlaylistEntry
{
    public ulong PlaylistEntryId { get; set; }

    public ulong PlaylistId { get; set; }

    public ulong SongId { get; set; }

    public ulong CreatedBy { get; set; }

    public ulong? RemovedBy { get; set; }

    public DateTime TimeAdded { get; set; }

    public DateTime? TimeRemoved { get; set; }

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual Playlist Playlist { get; set; } = null!;

    public virtual Song Song { get; set; } = null!;
}
