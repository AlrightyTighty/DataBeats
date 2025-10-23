using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class EventPictureFile
{
    public ulong EventPictureFileId { get; set; }

    public string FileName { get; set; } = null!;

    public string FileExtension { get; set; } = null!;

    public byte[] FileData { get; set; } = null!;

    public ulong? EventId { get; set; }

    public virtual Event? Event { get; set; }

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();
}
