using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserIsCollaboratorOfPlaylist
{
    public ulong UserIsCollaboratorOfPlaylistId { get; set; }

    public ulong UserId { get; set; }

    public ulong PlaylistId { get; set; }

    public DateTime TimeAdded { get; set; }

    public DateTime? TimeRemoved { get; set; }

    public ulong? RemovedBy { get; set; }

    public virtual Playlist Playlist { get; set; } = null!;

    public virtual User? RemovedByNavigation { get; set; }

    public virtual User User { get; set; } = null!;
}
