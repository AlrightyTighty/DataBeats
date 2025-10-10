using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class MusicianWorksOnAlbum
{
    public ulong MusicianId { get; set; }

    public ulong AlbumId { get; set; }

    public ulong MusicianWorksOnAlbumId { get; set; }

    public DateTime DateAdded { get; set; }

    public DateTime? DateRemoved { get; set; }

    public virtual Album Album { get; set; } = null!;

    public virtual Musician Musician { get; set; } = null!;
}
