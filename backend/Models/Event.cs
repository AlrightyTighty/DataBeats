using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Event
{
    public ulong EventId { get; set; }

    public ulong MusicianId { get; set; }

    public string Title { get; set; } = null!;

    public string EventDescription { get; set; } = null!;

    public ulong EventPictureFileId { get; set; }

    public string EventLocation { get; set; } = null!;

    public DateTime EventTime { get; set; }

    public decimal TicketPrice { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? DeletedBy { get; set; }

    public virtual ICollection<AdminDeletesEvent> AdminDeletesEvents { get; set; } = new List<AdminDeletesEvent>();

    public virtual User? DeletedByNavigation { get; set; }

    public virtual EventPictureFile EventPictureFile { get; set; } = null!;

    public virtual ICollection<EventPictureFile> EventPictureFiles { get; set; } = new List<EventPictureFile>();

    public virtual Musician Musician { get; set; } = null!;

    public virtual ICollection<MusicianHostsEvent> MusicianHostsEvents { get; set; } = new List<MusicianHostsEvent>();

    public virtual ICollection<UserAttendsEvent> UserAttendsEvents { get; set; } = new List<UserAttendsEvent>();
}
