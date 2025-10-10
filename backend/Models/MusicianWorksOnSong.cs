using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class MusicianWorksOnSong
{
    public ulong MusicianWorksOnSongsId { get; set; }

    public ulong MusicianId { get; set; }

    public ulong SongId { get; set; }

    public DateTime DateAdded { get; set; }

    public DateTime? DateRemoved { get; set; }

    public virtual Musician Musician { get; set; } = null!;

    public virtual Song Song { get; set; } = null!;
}
