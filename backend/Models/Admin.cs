using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Admin
{
    public ulong AdminId { get; set; }

    public ulong UserId { get; set; }

    public DateTime TimestampPromotion { get; set; }

    public DateTime TimestampCreated { get; set; }

    public ulong? CreatedBy { get; set; }

    public DateTime? TimestampUpdated { get; set; }

    public ulong? UpdatedBy { get; set; }

    public DateTime? TimestampDeleted { get; set; }

    public ulong? DeletedBy { get; set; }

    public virtual ICollection<AdminDeletesAlbum> AdminDeletesAlbumAdmins { get; set; } = new List<AdminDeletesAlbum>();

    public virtual ICollection<AdminDeletesAlbum> AdminDeletesAlbumDeletedByNavigations { get; set; } = new List<AdminDeletesAlbum>();

    public virtual ICollection<AdminDeletesAlbum> AdminDeletesAlbumUpdatedByNavigations { get; set; } = new List<AdminDeletesAlbum>();

    public virtual ICollection<AdminDeletesEvent> AdminDeletesEventAdmins { get; set; } = new List<AdminDeletesEvent>();

    public virtual ICollection<AdminDeletesEvent> AdminDeletesEventDeletedByNavigations { get; set; } = new List<AdminDeletesEvent>();

    public virtual ICollection<AdminDeletesMusician> AdminDeletesMusicianAdmins { get; set; } = new List<AdminDeletesMusician>();

    public virtual ICollection<AdminDeletesMusician> AdminDeletesMusicianDeletedByNavigations { get; set; } = new List<AdminDeletesMusician>();

    public virtual ICollection<AdminDeletesMusician> AdminDeletesMusicianUpdatedByNavigations { get; set; } = new List<AdminDeletesMusician>();

    public virtual ICollection<AdminDeletesPlaylist> AdminDeletesPlaylistAdmins { get; set; } = new List<AdminDeletesPlaylist>();

    public virtual ICollection<AdminDeletesPlaylist> AdminDeletesPlaylistDeletedByNavigations { get; set; } = new List<AdminDeletesPlaylist>();

    public virtual ICollection<AdminDeletesPlaylist> AdminDeletesPlaylistUpdatedByNavigations { get; set; } = new List<AdminDeletesPlaylist>();

    public virtual ICollection<AdminDeletesRating> AdminDeletesRatingAdmins { get; set; } = new List<AdminDeletesRating>();

    public virtual ICollection<AdminDeletesRating> AdminDeletesRatingDeletedByNavigations { get; set; } = new List<AdminDeletesRating>();

    public virtual ICollection<AdminDeletesRating> AdminDeletesRatingUpdatedByNavigations { get; set; } = new List<AdminDeletesRating>();

    public virtual ICollection<AdminDeletesSong> AdminDeletesSongAdmins { get; set; } = new List<AdminDeletesSong>();

    public virtual ICollection<AdminDeletesSong> AdminDeletesSongDeletedByNavigations { get; set; } = new List<AdminDeletesSong>();

    public virtual ICollection<AdminDeletesSong> AdminDeletesSongUpdatedByNavigations { get; set; } = new List<AdminDeletesSong>();

    public virtual ICollection<AdminManagesUser> AdminManagesUserAdmins { get; set; } = new List<AdminManagesUser>();

    public virtual ICollection<AdminManagesUser> AdminManagesUserCreatedByNavigations { get; set; } = new List<AdminManagesUser>();

    public virtual ICollection<AdminManagesUser> AdminManagesUserRevokedByNavigations { get; set; } = new List<AdminManagesUser>();

    public virtual User? CreatedByNavigation { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User? UpdatedByNavigation { get; set; }

    public virtual User User { get; set; } = null!;
}
