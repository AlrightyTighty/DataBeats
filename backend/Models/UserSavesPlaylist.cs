using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserSavesPlaylist
{
    public ulong UserSavesPlaylistId { get; set; }

    public ulong PlaylistId { get; set; }

    public ulong UserId { get; set; }

    public DateTime TimeSaved { get; set; }

    public DateTime? TimeUnsaved { get; set; }

    public virtual Playlist Playlist { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
