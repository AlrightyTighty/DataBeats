using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class VwAlbumActivity
{
    public ulong AlbumId { get; set; }

    public string AlbumTitle { get; set; } = null!;

    public ulong CreatedBy { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public DateTime ReleaseDate { get; set; }

    public int NumSongs { get; set; }

    public int IsDeleted { get; set; }
}
