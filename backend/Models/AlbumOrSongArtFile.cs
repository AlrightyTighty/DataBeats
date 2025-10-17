using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class AlbumOrSongArtFile
{
    public ulong AlbumOrSongArtFileId { get; set; }

    public string FileName { get; set; } = null!;

    public string FileExtension { get; set; } = null!;

    public byte[] FileData { get; set; } = null!;
}
