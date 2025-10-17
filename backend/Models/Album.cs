using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Album
{
    public ulong AlbumId { get; set; }

    public string AlbumTitle { get; set; } = null!;

    public DateTime ReleaseDate { get; set; }

    public int NumSongs { get; set; }

    public TimeOnly Duration { get; set; }

    public string AlbumType { get; set; } = null!;

    public DateTime TimestampCreated { get; set; }

    public ulong CreatedBy { get; set; }

    public DateTime? TimestampUpdated { get; set; }

    public ulong? UpdatedBy { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? DeletedBy { get; set; }

    public ulong AlbumOrSongArtFileId { get; set; }

    public virtual ICollection<AdminDeletesAlbum> AdminDeletesAlbums { get; set; } = new List<AdminDeletesAlbum>();

    public virtual ICollection<AlbumContainsSong> AlbumContainsSongs { get; set; } = new List<AlbumContainsSong>();

    public virtual ICollection<AlbumGenre> AlbumGenres { get; set; } = new List<AlbumGenre>();

    public virtual Musician CreatedByNavigation { get; set; } = null!;

    public virtual User? DeletedByNavigation { get; set; }

    public virtual ICollection<MusicianWorksOnAlbum> MusicianWorksOnAlbums { get; set; } = new List<MusicianWorksOnAlbum>();

    public virtual Musician? UpdatedByNavigation { get; set; }
}
