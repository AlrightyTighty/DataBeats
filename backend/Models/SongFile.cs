using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class SongFile
{
    public ulong SongFileId { get; set; }

    public string FileName { get; set; } = null!;

    public string FileExtension { get; set; } = null!;

    public byte[] FileData { get; set; } = null!;

    public TimeOnly Duration { get; set; }

    public ulong SongId { get; set; }

    public virtual Song Song { get; set; } = null!;
}
