using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Song
{
    public ulong SongId { get; set; }

    public string SongName { get; set; } = null!;

    public string? Lyrics { get; set; }

    public int Streams { get; set; }

    public TimeOnly Duration { get; set; }

    public DateTime TimestampCreated { get; set; }

    public ulong CreatedBy { get; set; }

    public DateTime? TimestampUpdated { get; set; }

    public ulong? UpdatedBy { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? DeletedBy { get; set; }

    public ulong SongFileId { get; set; }

    public ulong AlbumId { get; set; }

    public virtual ICollection<AdminDeletesSong> AdminDeletesSongs { get; set; } = new List<AdminDeletesSong>();

    public virtual Album Album { get; set; } = null!;

    public virtual ICollection<AlbumContainsSong> AlbumContainsSongs { get; set; } = new List<AlbumContainsSong>();

    public virtual Musician CreatedByNavigation { get; set; } = null!;

    public virtual User? DeletedByNavigation { get; set; }

    public virtual ICollection<MusicianWorksOnSong> MusicianWorksOnSongs { get; set; } = new List<MusicianWorksOnSong>();

    public virtual ICollection<PlaylistEntry> PlaylistEntries { get; set; } = new List<PlaylistEntry>();

    public virtual ICollection<SongFile> SongFiles { get; set; } = new List<SongFile>();

    public virtual ICollection<SongGenre> SongGenres { get; set; } = new List<SongGenre>();

    public virtual ICollection<SongLyricist> SongLyricists { get; set; } = new List<SongLyricist>();

    public virtual ICollection<SongProducer> SongProducers { get; set; } = new List<SongProducer>();

    public virtual Musician? UpdatedByNavigation { get; set; }

    public virtual ICollection<UserListensToSong> UserListensToSongs { get; set; } = new List<UserListensToSong>();

    public virtual ICollection<UserRatesSong> UserRatesSongs { get; set; } = new List<UserRatesSong>();
}
