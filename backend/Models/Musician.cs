using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Musician
{
    public ulong MusicianId { get; set; }

    public ulong UserId { get; set; }

    public string MusicianName { get; set; } = null!;

    public string? Bio { get; set; }

    public string? Label { get; set; }

    public int FollowerCount { get; set; }

    public int MonthlyListenerCount { get; set; }

    public DateTime TimestampCreated { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? CreatedBy { get; set; }

    public ulong? DeletedBy { get; set; }

    public ulong ProfilePictureFileId { get; set; }

    public bool IsVerified { get; set; }

    public virtual ICollection<AdminDeletesMusician> AdminDeletesMusicians { get; set; } = new List<AdminDeletesMusician>();

    public virtual ICollection<AlbumContainsSong> AlbumContainsSongs { get; set; } = new List<AlbumContainsSong>();

    public virtual ICollection<Album> AlbumCreatedByNavigations { get; set; } = new List<Album>();

    public virtual ICollection<AlbumGenre> AlbumGenreCreatedByNavigations { get; set; } = new List<AlbumGenre>();

    public virtual ICollection<AlbumGenre> AlbumGenreUpdatedByNavigations { get; set; } = new List<AlbumGenre>();

    public virtual ICollection<Album> AlbumUpdatedByNavigations { get; set; } = new List<Album>();

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    public virtual ICollection<MusicianHostsEvent> MusicianHostsEvents { get; set; } = new List<MusicianHostsEvent>();

    public virtual ICollection<MusicianWorksOnAlbum> MusicianWorksOnAlbums { get; set; } = new List<MusicianWorksOnAlbum>();

    public virtual ICollection<MusicianWorksOnSong> MusicianWorksOnSongs { get; set; } = new List<MusicianWorksOnSong>();

    public virtual ProfilePictureFile ProfilePictureFile { get; set; } = null!;

    public virtual ICollection<Song> SongCreatedByNavigations { get; set; } = new List<Song>();

    public virtual ICollection<SongFile> SongFiles { get; set; } = new List<SongFile>();

    public virtual ICollection<SongGenre> SongGenreCreatedByNavigations { get; set; } = new List<SongGenre>();

    public virtual ICollection<SongGenre> SongGenreUpdatedByNavigations { get; set; } = new List<SongGenre>();

    public virtual ICollection<SongLyricist> SongLyricistCreatedByNavigations { get; set; } = new List<SongLyricist>();

    public virtual ICollection<SongLyricist> SongLyricistUpdatedByNavigations { get; set; } = new List<SongLyricist>();

    public virtual ICollection<SongProducer> SongProducerCreatedByNavigations { get; set; } = new List<SongProducer>();

    public virtual ICollection<SongProducer> SongProducerUpdatedByNavigations { get; set; } = new List<SongProducer>();

    public virtual ICollection<Song> SongUpdatedByNavigations { get; set; } = new List<Song>();

    public virtual User User { get; set; } = null!;
}
