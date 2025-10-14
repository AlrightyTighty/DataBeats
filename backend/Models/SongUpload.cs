using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class SongUpload
{
    public ulong IdSongUpload { get; set; }

    public string? Path { get; set; }
}
