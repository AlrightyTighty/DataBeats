using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class User
{
    public ulong UserId { get; set; }

    public string Username { get; set; } = null!;

    public string? Fname { get; set; }

    public string? Lname { get; set; }

    public string? Link { get; set; }

    public DateTime? TimeCreated { get; set; }

    public DateTime? TimeDeleted { get; set; }

    public ulong? AdminId { get; set; }

    public ulong? MusicianId { get; set; }

    public ulong? AuthenticationInformationId { get; set; }

    public ulong? ProfilePictureFileId { get; set; }

    public virtual ICollection<Admin> AdminCreatedByNavigations { get; set; } = new List<Admin>();

    public virtual ICollection<Admin> AdminDeletedByNavigations { get; set; } = new List<Admin>();

    public virtual ICollection<AdminManagesUser> AdminManagesUsers { get; set; } = new List<AdminManagesUser>();

    public virtual ICollection<Admin> AdminUpdatedByNavigations { get; set; } = new List<Admin>();

    public virtual ICollection<Admin> AdminUsers { get; set; } = new List<Admin>();

    public virtual ICollection<AlbumContainsSong> AlbumContainsSongs { get; set; } = new List<AlbumContainsSong>();

    public virtual ICollection<AlbumGenre> AlbumGenres { get; set; } = new List<AlbumGenre>();

    public virtual ICollection<Album> Albums { get; set; } = new List<Album>();

    public virtual AuthenticationInformation? AuthenticationInformation { get; set; }

    public virtual AuthenticationInformation? AuthenticationInformationNavigation { get; set; }

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    public virtual ICollection<Musician> Musicians { get; set; } = new List<Musician>();

    public virtual ICollection<Playlist> PlaylistDeletedByNavigations { get; set; } = new List<Playlist>();

    public virtual ICollection<PlaylistEntry> PlaylistEntries { get; set; } = new List<PlaylistEntry>();

    public virtual ICollection<Playlist> PlaylistUsers { get; set; } = new List<Playlist>();

    public virtual ProfilePictureFile? ProfilePictureFile { get; set; }

    public virtual ICollection<Review> ReviewCreatedByNavigations { get; set; } = new List<Review>();

    public virtual ICollection<Review> ReviewDeletedByNavigations { get; set; } = new List<Review>();

    public virtual ICollection<Review> ReviewUpdatedByNavigations { get; set; } = new List<Review>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<SongGenre> SongGenres { get; set; } = new List<SongGenre>();

    public virtual ICollection<SongLyricist> SongLyricists { get; set; } = new List<SongLyricist>();

    public virtual ICollection<SongProducer> SongProducers { get; set; } = new List<SongProducer>();

    public virtual ICollection<Song> Songs { get; set; } = new List<Song>();

    public virtual ICollection<UserAttendsEvent> UserAttendsEvents { get; set; } = new List<UserAttendsEvent>();

    public virtual ICollection<UserFollowsUser> UserFollowsUserFolloweeNavigations { get; set; } = new List<UserFollowsUser>();

    public virtual ICollection<UserFollowsUser> UserFollowsUserFollowerNavigations { get; set; } = new List<UserFollowsUser>();

    public virtual ICollection<UserFriendsWithUser> UserFriendsWithUserFriendees { get; set; } = new List<UserFriendsWithUser>();

    public virtual ICollection<UserFriendsWithUser> UserFriendsWithUserFrienders { get; set; } = new List<UserFriendsWithUser>();

    public virtual ICollection<UserIsCollaboratorOfPlaylist> UserIsCollaboratorOfPlaylistRemovedByNavigations { get; set; } = new List<UserIsCollaboratorOfPlaylist>();

    public virtual ICollection<UserIsCollaboratorOfPlaylist> UserIsCollaboratorOfPlaylistUsers { get; set; } = new List<UserIsCollaboratorOfPlaylist>();

    public virtual ICollection<UserListensToSong> UserListensToSongs { get; set; } = new List<UserListensToSong>();

    public virtual ICollection<UserRatesSong> UserRatesSongCommentDeletedByNavigations { get; set; } = new List<UserRatesSong>();

    public virtual ICollection<UserRatesSong> UserRatesSongDeletedByNavigations { get; set; } = new List<UserRatesSong>();

    public virtual ICollection<UserRatesSong> UserRatesSongUsers { get; set; } = new List<UserRatesSong>();
}
