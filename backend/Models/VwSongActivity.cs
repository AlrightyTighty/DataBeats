using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class VwSongActivity
{
    public ulong SongId { get; set; }

    public string SongName { get; set; } = null!;

    public ulong AlbumId { get; set; }

    public ulong CreatedBy { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public int Streams { get; set; }

    public int IsDeleted { get; set; }
}
