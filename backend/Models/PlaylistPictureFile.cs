using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class PlaylistPictureFile
{
    public ulong PlaylistPictureFileId { get; set; }

    public string FileName { get; set; } = null!;

    public string FileExtension { get; set; } = null!;

    public byte[] FileData { get; set; } = null!;

    public virtual ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
}
