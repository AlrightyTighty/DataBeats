using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class MusicianReport
{
    public string? MusicianIds { get; set; }

    public DateTime ReleaseDate { get; set; }

    public ulong AlbumId { get; set; }

    public string AlbumTitle { get; set; } = null!;

    public string SongName { get; set; } = null!;

    public string Genres { get; set; } = null!;

    public double? AvgRating { get; set; }

    public long Likes { get; set; }

    public long Streams { get; set; }
}
