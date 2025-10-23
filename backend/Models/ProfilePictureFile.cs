using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ProfilePictureFile
{
    public ulong ProfilePictureFileId { get; set; }

    public string FileName { get; set; } = null!;

    public string FileExtension { get; set; } = null!;

    public byte[] FileData { get; set; } = null!;

    public virtual ICollection<Musician> Musicians { get; set; } = new List<Musician>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
