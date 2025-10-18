using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Playlist
{
    public ulong PlaylistId { get; set; }

    public ulong UserId { get; set; }

    public string PlaylistName { get; set; } = null!;

    public string PlaylistPic { get; set; } = null!;

    public string? PlaylistDescription { get; set; }

    public string Access { get; set; } = null!;

    public int NumOfSongs { get; set; }

    public TimeOnly Duration { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? DeletedBy { get; set; }

    public virtual ICollection<AdminDeletesPlaylist> AdminDeletesPlaylists { get; set; } = new List<AdminDeletesPlaylist>();

    public virtual User? DeletedByNavigation { get; set; }

    public virtual ICollection<PlaylistEntry> PlaylistEntries { get; set; } = new List<PlaylistEntry>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<UserIsCollaboratorOfPlaylist> UserIsCollaboratorOfPlaylists { get; set; } = new List<UserIsCollaboratorOfPlaylist>();
}
