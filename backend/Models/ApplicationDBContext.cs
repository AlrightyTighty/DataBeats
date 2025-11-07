using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace backend.Models;

public partial class ApplicationDBContext : DbContext
{
    public ApplicationDBContext()
    {
    }

    public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<AdminDeletesAlbum> AdminDeletesAlbums { get; set; }

    public virtual DbSet<AdminDeletesMusician> AdminDeletesMusicians { get; set; }

    public virtual DbSet<AdminDeletesPlaylist> AdminDeletesPlaylists { get; set; }

    public virtual DbSet<AdminDeletesRating> AdminDeletesRatings { get; set; }

    public virtual DbSet<AdminDeletesSong> AdminDeletesSongs { get; set; }

    public virtual DbSet<AdminManagesUser> AdminManagesUsers { get; set; }

    public virtual DbSet<Album> Albums { get; set; }

    public virtual DbSet<AlbumContainsSong> AlbumContainsSongs { get; set; }

    public virtual DbSet<AlbumGenre> AlbumGenres { get; set; }

    public virtual DbSet<AlbumOrSongArtFile> AlbumOrSongArtFiles { get; set; }

    public virtual DbSet<AuthenticationInformation> AuthenticationInformations { get; set; }

    public virtual DbSet<Complaint> Complaints { get; set; }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<EventPictureFile> EventPictureFiles { get; set; }

    public virtual DbSet<Musician> Musicians { get; set; }

    public virtual DbSet<MusicianHostsEvent> MusicianHostsEvents { get; set; }

    public virtual DbSet<MusicianWorksOnAlbum> MusicianWorksOnAlbums { get; set; }

    public virtual DbSet<MusicianWorksOnSong> MusicianWorksOnSongs { get; set; }

    public virtual DbSet<Playlist> Playlists { get; set; }

    public virtual DbSet<PlaylistEntry> PlaylistEntries { get; set; }

    public virtual DbSet<PlaylistPictureFile> PlaylistPictureFiles { get; set; }

    public virtual DbSet<ProfilePictureFile> ProfilePictureFiles { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<Song> Songs { get; set; }

    public virtual DbSet<SongFile> SongFiles { get; set; }

    public virtual DbSet<SongGenre> SongGenres { get; set; }

    public virtual DbSet<SongLyricist> SongLyricists { get; set; }

    public virtual DbSet<SongProducer> SongProducers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAttendsEvent> UserAttendsEvents { get; set; }

    public virtual DbSet<UserFollowsUser> UserFollowsUsers { get; set; }

    public virtual DbSet<UserFriendsWithUser> UserFriendsWithUsers { get; set; }

    public virtual DbSet<UserIsCollaboratorOfPlaylist> UserIsCollaboratorOfPlaylists { get; set; }

    public virtual DbSet<UserLikesSong> UserLikesSongs { get; set; }

    public virtual DbSet<UserListensToSong> UserListensToSongs { get; set; }

    public virtual DbSet<UserRatesSong> UserRatesSongs { get; set; }

    public virtual DbSet<UserSavesPlaylist> UserSavesPlaylists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseMySql(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"), Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.42-mysql"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.AdminId).HasName("PRIMARY");

            entity.ToTable("admin");

            entity.HasIndex(e => e.CreatedBy, "FK_created_by");

            entity.HasIndex(e => e.DeletedBy, "FK_deleted_by");

            entity.HasIndex(e => e.UpdatedBy, "FK_updated_by");

            entity.HasIndex(e => e.UserId, "FK_user_id");

            entity.HasIndex(e => e.AdminId, "admin_id").IsUnique();

            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampPromotion)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_promotion");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.AdminCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_created_by");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.AdminDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK_deleted_by");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AdminUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK_updated_by");

            entity.HasOne(d => d.User).WithMany(p => p.AdminUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_user_id");
        });

        modelBuilder.Entity<AdminDeletesAlbum>(entity =>
        {
            entity.HasKey(e => e.AdminDeletesAlbumId).HasName("PRIMARY");

            entity.ToTable("admin_deletes_album");

            entity.HasIndex(e => e.AdminDeletesAlbumId, "admin_deletes_playlist_id").IsUnique();

            entity.HasIndex(e => e.AdminId, "admin_id");

            entity.HasIndex(e => e.AlbumId, "album_id");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.AdminDeletesAlbumId).HasColumnName("admin_deletes_album_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.AlbumId).HasColumnName("album_id");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.Reason)
                .HasColumnType("text")
                .HasColumnName("reason");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminDeletesAlbumAdmins)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_album_ibfk_1");

            entity.HasOne(d => d.Album).WithMany(p => p.AdminDeletesAlbums)
                .HasForeignKey(d => d.AlbumId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_album_ibfk_2");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.AdminDeletesAlbumDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_album_ibfk_3");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AdminDeletesAlbumUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_album_ibfk_4");
        });

        modelBuilder.Entity<AdminDeletesMusician>(entity =>
        {
            entity.HasKey(e => e.AdminDeletesMusicianId).HasName("PRIMARY");

            entity.ToTable("admin_deletes_musician");

            entity.HasIndex(e => e.AdminDeletesMusicianId, "admin_deletes_eventevent_id").IsUnique();

            entity.HasIndex(e => e.AdminId, "admin_id");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.MusicianId, "musician_id");

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.AdminDeletesMusicianId).HasColumnName("admin_deletes_musician_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.MusicianId).HasColumnName("musician_id");
            entity.Property(e => e.Reason)
                .HasColumnType("text")
                .HasColumnName("reason");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminDeletesMusicianAdmins)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_musician_ibfk_1");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.AdminDeletesMusicianDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_musician_ibfk_3");

            entity.HasOne(d => d.Musician).WithMany(p => p.AdminDeletesMusicians)
                .HasForeignKey(d => d.MusicianId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_musician_ibfk_2");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AdminDeletesMusicianUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_musician_ibfk_4");
        });

        modelBuilder.Entity<AdminDeletesPlaylist>(entity =>
        {
            entity.HasKey(e => e.AdminDeletesPlaylistId).HasName("PRIMARY");

            entity.ToTable("admin_deletes_playlist");

            entity.HasIndex(e => e.AdminDeletesPlaylistId, "admin_deletes_playlist_id").IsUnique();

            entity.HasIndex(e => e.AdminId, "admin_id");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.PlaylistId, "playlist_id");

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.AdminDeletesPlaylistId).HasColumnName("admin_deletes_playlist_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.PlaylistId).HasColumnName("playlist_id");
            entity.Property(e => e.Reason)
                .HasColumnType("text")
                .HasColumnName("reason");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminDeletesPlaylistAdmins)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_playlist_ibfk_1");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.AdminDeletesPlaylistDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_playlist_ibfk_3");

            entity.HasOne(d => d.Playlist).WithMany(p => p.AdminDeletesPlaylists)
                .HasForeignKey(d => d.PlaylistId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_playlist_ibfk_2");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AdminDeletesPlaylistUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_playlist_ibfk_4");
        });

        modelBuilder.Entity<AdminDeletesRating>(entity =>
        {
            entity.HasKey(e => e.AdminManagesRatingId).HasName("PRIMARY");

            entity.ToTable("admin_deletes_rating");

            entity.HasIndex(e => e.AdminId, "admin_id");

            entity.HasIndex(e => e.AdminManagesRatingId, "admin_manages_rating").IsUnique();

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.ReviewId, "review_id");

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.AdminManagesRatingId).HasColumnName("admin_manages_rating_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.Reason)
                .HasColumnType("text")
                .HasColumnName("reason");
            entity.Property(e => e.ReviewId).HasColumnName("review_id");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminDeletesRatingAdmins)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_rating_ibfk_1");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.AdminDeletesRatingDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_rating_ibfk_3");

            entity.HasOne(d => d.Review).WithMany(p => p.AdminDeletesRatings)
                .HasForeignKey(d => d.ReviewId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_rating_ibfk_2");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AdminDeletesRatingUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_rating_ibfk_4");
        });

        modelBuilder.Entity<AdminDeletesSong>(entity =>
        {
            entity.HasKey(e => e.AdminDeletesSongId).HasName("PRIMARY");

            entity.ToTable("admin_deletes_song");

            entity.HasIndex(e => e.AdminDeletesSongId, "admin_deletes_song_id").IsUnique();

            entity.HasIndex(e => e.AdminId, "admin_id");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.SongId, "song_id");

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.AdminDeletesSongId).HasColumnName("admin_deletes_song_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.Reason)
                .HasColumnType("text")
                .HasColumnName("reason");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminDeletesSongAdmins)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_song_ibfk_1");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.AdminDeletesSongDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_song_ibfk_3");

            entity.HasOne(d => d.Song).WithMany(p => p.AdminDeletesSongs)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_deletes_song_ibfk_2");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AdminDeletesSongUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("admin_deletes_song_ibfk_4");
        });

        modelBuilder.Entity<AdminManagesUser>(entity =>
        {
            entity.HasKey(e => e.AdminManagesUserId).HasName("PRIMARY");

            entity.ToTable("admin_manages_user");

            entity.HasIndex(e => e.AdminId, "admin_id");

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.AdminManagesUserId, "manage_user_id").IsUnique();

            entity.HasIndex(e => e.RevokedBy, "revoked_by");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.AdminManagesUserId).HasColumnName("admin_manages_user_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.EndsAt)
                .HasColumnType("datetime")
                .HasColumnName("ends_at");
            entity.Property(e => e.Reason)
                .HasColumnType("text")
                .HasColumnName("reason");
            entity.Property(e => e.RevokedAt)
                .HasColumnType("datetime")
                .HasColumnName("revoked_at");
            entity.Property(e => e.RevokedBy).HasColumnName("revoked_by");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminManagesUserAdmins)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_manages_user_ibfk_1");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.AdminManagesUserCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("admin_manages_user_ibfk_3");

            entity.HasOne(d => d.RevokedByNavigation).WithMany(p => p.AdminManagesUserRevokedByNavigations)
                .HasForeignKey(d => d.RevokedBy)
                .HasConstraintName("admin_manages_user_ibfk_4");

            entity.HasOne(d => d.User).WithMany(p => p.AdminManagesUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_manages_user_ibfk_2");
        });

        modelBuilder.Entity<Album>(entity =>
        {
            entity.HasKey(e => e.AlbumId).HasName("PRIMARY");

            entity.ToTable("album");

            entity.HasIndex(e => e.AlbumOrSongArtFileId, "album_ibfk_4_idx");

            entity.HasIndex(e => e.AlbumId, "album_id").IsUnique();

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.AlbumId).HasColumnName("album_id");
            entity.Property(e => e.AlbumOrSongArtFileId).HasColumnName("album_or_song_art_file_id");
            entity.Property(e => e.AlbumTitle)
                .HasMaxLength(50)
                .HasColumnName("album_title");
            entity.Property(e => e.AlbumType)
                .HasColumnType("enum('SINGLE','EP','ALBUM')")
                .HasColumnName("album_type");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.Duration)
                .HasColumnType("time")
                .HasColumnName("duration");
            entity.Property(e => e.NumSongs).HasColumnName("num_songs");
            entity.Property(e => e.ReleaseDate)
                .HasColumnType("datetime")
                .HasColumnName("release_date");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.AlbumOrSongArtFile).WithMany(p => p.Albums)
                .HasForeignKey(d => d.AlbumOrSongArtFileId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("album_ibfk_4");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.AlbumCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("album_ibfk_1");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.Albums)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("album_ibfk_3");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AlbumUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("album_ibfk_2");
        });

        modelBuilder.Entity<AlbumContainsSong>(entity =>
        {
            entity.HasKey(e => e.AlbumContainsSongId).HasName("PRIMARY");

            entity.ToTable("album_contains_song");

            entity.HasIndex(e => e.AlbumContainsSongId, "album_contains_song_id").IsUnique();

            entity.HasIndex(e => e.AlbumId, "album_id");

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.SongId, "song_id");

            entity.Property(e => e.AlbumContainsSongId).HasColumnName("album_contains_song_id");
            entity.Property(e => e.AlbumId).HasColumnName("album_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Album).WithMany(p => p.AlbumContainsSongs)
                .HasForeignKey(d => d.AlbumId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("album_contains_song_ibfk_1");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.AlbumContainsSongs)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("album_contains_song_ibfk_3");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.AlbumContainsSongs)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("album_contains_song_ibfk_4");

            entity.HasOne(d => d.Song).WithMany(p => p.AlbumContainsSongs)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("album_contains_song_ibfk_2");
        });

        modelBuilder.Entity<AlbumGenre>(entity =>
        {
            entity.HasKey(e => e.AlbumGenreId).HasName("PRIMARY");

            entity.ToTable("album_genre");

            entity.HasIndex(e => e.AlbumGenreId, "album_genre_id").IsUnique();

            entity.HasIndex(e => e.AlbumId, "album_id");

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.AlbumGenreId).HasColumnName("album_genre_id");
            entity.Property(e => e.AlbumId).HasColumnName("album_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.Genre)
                .HasMaxLength(30)
                .HasColumnName("genre");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Album).WithMany(p => p.AlbumGenres)
                .HasForeignKey(d => d.AlbumId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("album_genre_ibfk_1");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.AlbumGenreCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("album_genre_ibfk_2");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.AlbumGenres)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("album_genre_ibfk_4");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AlbumGenreUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("album_genre_ibfk_3");
        });

        modelBuilder.Entity<AlbumOrSongArtFile>(entity =>
        {
            entity.HasKey(e => e.AlbumOrSongArtFileId).HasName("PRIMARY");

            entity.ToTable("album_or_song_art_file");

            entity.Property(e => e.AlbumOrSongArtFileId).HasColumnName("album_or_song_art_file_id");
            entity.Property(e => e.FileData)
                .HasColumnType("mediumblob")
                .HasColumnName("file_data");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(4)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(50)
                .HasColumnName("file_name");
        });

        modelBuilder.Entity<AuthenticationInformation>(entity =>
        {
            entity.HasKey(e => e.AuthenticationInformationId).HasName("PRIMARY");

            entity.ToTable("authentication_information");

            entity.HasIndex(e => e.AuthenticationInformationId, "authentication_information_id").IsUnique();

            entity.HasIndex(e => e.UserId, "unique_authinfo_user").IsUnique();

            entity.HasIndex(e => e.Email, "unique_email").IsUnique();

            entity.Property(e => e.AuthenticationInformationId).HasColumnName("authentication_information_id");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.LockExpiration)
                .HasColumnType("datetime")
                .HasColumnName("lock_expiration");
            entity.Property(e => e.Locked).HasColumnName("locked");
            entity.Property(e => e.LoginAttempts).HasColumnName("login_attempts");
            entity.Property(e => e.Password)
                .HasMaxLength(50)
                .HasColumnName("password");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.AuthenticationInformation)
                .HasForeignKey<AuthenticationInformation>(d => d.UserId)
                .HasConstraintName("authentication_information_ibfk_1");
        });

        modelBuilder.Entity<Complaint>(entity =>
        {
            entity.HasKey(e => e.ComplaintId).HasName("PRIMARY");

            entity.ToTable("complaint");

            entity.HasIndex(e => e.ComplaintId, "complaint_id").IsUnique();

            entity.Property(e => e.ComplaintId).HasColumnName("complaint_id");
            entity.Property(e => e.ComplaintReason)
                .HasColumnType("enum('INAPPROPRIATE','HARASSMENT','DMCA','SPAM','IMPERSONATION','OTHER')")
                .HasColumnName("complaint_reason");
            entity.Property(e => e.ComplaintTargetId).HasColumnName("complaint_target_id");
            entity.Property(e => e.ComplaintType)
                .HasColumnType("enum('USER','MUSICIAN','SONG','EVENT','RATING','PLAYLIST','ADMIN','ALBUM')")
                .HasColumnName("complaint_type");
            entity.Property(e => e.TimeCreated)
                .HasColumnType("timestamp")
                .HasColumnName("time_created");
            entity.Property(e => e.TimeDeleted)
                .HasColumnType("timestamp")
                .HasColumnName("time_deleted");
            entity.Property(e => e.UserComment)
                .HasMaxLength(500)
                .HasColumnName("user_comment");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.EventId).HasName("PRIMARY");

            entity.ToTable("event");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.EventPictureFileId, "event_ibfk_3_idx");

            entity.HasIndex(e => e.EventId, "event_id").IsUnique();

            entity.HasIndex(e => e.MusicianId, "musician_id");

            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.EventDescription)
                .HasMaxLength(500)
                .HasColumnName("event_description");
            entity.Property(e => e.EventPictureFileId).HasColumnName("event_picture_file_id");
            entity.Property(e => e.EventTime)
                .HasColumnType("datetime")
                .HasColumnName("event_time");
            entity.Property(e => e.MusicianId).HasColumnName("musician_id");
            entity.Property(e => e.TicketPrice)
                .HasPrecision(6, 2)
                .HasColumnName("ticket_price");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.Events)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("event_ibfk_2");

            entity.HasOne(d => d.EventPictureFile).WithMany(p => p.Events)
                .HasForeignKey(d => d.EventPictureFileId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("event_ibfk_3");

            entity.HasOne(d => d.Musician).WithMany(p => p.Events)
                .HasForeignKey(d => d.MusicianId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("event_ibfk_1");
        });

        modelBuilder.Entity<EventPictureFile>(entity =>
        {
            entity.HasKey(e => e.EventPictureFileId).HasName("PRIMARY");

            entity.ToTable("event_picture_file");

            entity.HasIndex(e => e.EventId, "event_picture_file_fk1_idx");

            entity.HasIndex(e => e.EventPictureFileId, "event_picture_file_id_UNIQUE").IsUnique();

            entity.Property(e => e.EventPictureFileId).HasColumnName("event_picture_file_id");
            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.FileData)
                .HasColumnType("mediumblob")
                .HasColumnName("file_data");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(4)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(50)
                .HasColumnName("file_name");

            entity.HasOne(d => d.Event).WithMany(p => p.EventPictureFiles)
                .HasForeignKey(d => d.EventId)
                .HasConstraintName("event_picture_file_fk1");
        });

        modelBuilder.Entity<Musician>(entity =>
        {
            entity.HasKey(e => e.MusicianId).HasName("PRIMARY");

            entity.ToTable("musician");

            entity.HasIndex(e => e.ProfilePictureFileId, "musician_ibfk_2_idx");

            entity.HasIndex(e => e.MusicianId, "musician_id").IsUnique();

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.MusicianId).HasColumnName("musician_id");
            entity.Property(e => e.Bio)
                .HasMaxLength(700)
                .HasColumnName("bio");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.FollowerCount).HasColumnName("follower_count");
            entity.Property(e => e.Label)
                .HasMaxLength(50)
                .HasColumnName("label");
            entity.Property(e => e.MonthlyListenerCount).HasColumnName("monthly_listener_count");
            entity.Property(e => e.MusicianName)
                .HasMaxLength(50)
                .HasColumnName("musician_name");
            entity.Property(e => e.ProfilePictureFileId).HasColumnName("profile_picture_file_id");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.ProfilePictureFile).WithMany(p => p.Musicians)
                .HasForeignKey(d => d.ProfilePictureFileId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("musician_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.Musicians)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("musician_ibfk_1");
        });

        modelBuilder.Entity<MusicianHostsEvent>(entity =>
        {
            entity.HasKey(e => e.MusicianHostsEventId).HasName("PRIMARY");

            entity.ToTable("musician_hosts_event");

            entity.HasIndex(e => e.MusicianId, "musician_hosts_event_ibfk1_idx");

            entity.HasIndex(e => e.EventId, "musician_hosts_event_ibfk2_idx");

            entity.Property(e => e.MusicianHostsEventId).HasColumnName("musician_hosts_event_id");
            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.MusicianId).HasColumnName("musician_id");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");

            entity.HasOne(d => d.Event).WithMany(p => p.MusicianHostsEvents)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("musician_hosts_event_ibfk2");

            entity.HasOne(d => d.Musician).WithMany(p => p.MusicianHostsEvents)
                .HasForeignKey(d => d.MusicianId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("musician_hosts_event_ibfk1");
        });

        modelBuilder.Entity<MusicianWorksOnAlbum>(entity =>
        {
            entity.HasKey(e => e.MusicianWorksOnAlbumId).HasName("PRIMARY");

            entity.ToTable("musician_works_on_album");

            entity.HasIndex(e => e.AlbumId, "album_id");

            entity.HasIndex(e => e.MusicianId, "musician_id");

            entity.Property(e => e.MusicianWorksOnAlbumId).HasColumnName("musician_works_on_album_id");
            entity.Property(e => e.AlbumId).HasColumnName("album_id");
            entity.Property(e => e.DateAdded)
                .HasColumnType("datetime")
                .HasColumnName("date_added");
            entity.Property(e => e.DateRemoved)
                .HasColumnType("datetime")
                .HasColumnName("date_removed");
            entity.Property(e => e.MusicianId).HasColumnName("musician_id");

            entity.HasOne(d => d.Album).WithMany(p => p.MusicianWorksOnAlbums)
                .HasForeignKey(d => d.AlbumId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("musician_works_on_album_ibfk_2");

            entity.HasOne(d => d.Musician).WithMany(p => p.MusicianWorksOnAlbums)
                .HasForeignKey(d => d.MusicianId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("musician_works_on_album_ibfk_1");
        });

        modelBuilder.Entity<MusicianWorksOnSong>(entity =>
        {
            entity.HasKey(e => e.MusicianWorksOnSongsId).HasName("PRIMARY");

            entity.ToTable("musician_works_on_song");

            entity.HasIndex(e => e.MusicianId, "musician_id");

            entity.HasIndex(e => e.SongId, "song_id");

            entity.Property(e => e.MusicianWorksOnSongsId).HasColumnName("musician_works_on_songs_id");
            entity.Property(e => e.DateAdded)
                .HasColumnType("timestamp")
                .HasColumnName("date_added");
            entity.Property(e => e.DateRemoved)
                .HasColumnType("timestamp")
                .HasColumnName("date_removed");
            entity.Property(e => e.MusicianId).HasColumnName("musician_id");
            entity.Property(e => e.SongId).HasColumnName("song_id");

            entity.HasOne(d => d.Musician).WithMany(p => p.MusicianWorksOnSongs)
                .HasForeignKey(d => d.MusicianId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("musician_works_on_song_ibfk_2");

            entity.HasOne(d => d.Song).WithMany(p => p.MusicianWorksOnSongs)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("musician_works_on_song_ibfk_1");
        });

        modelBuilder.Entity<Playlist>(entity =>
        {
            entity.HasKey(e => e.PlaylistId).HasName("PRIMARY");

            entity.ToTable("playlist");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.UserId, "fk_user_id_idx");

            entity.HasIndex(e => e.PlaylistPictureFileId, "playlist_ibfk_3_idx");

            entity.HasIndex(e => e.PlaylistId, "playlist_id").IsUnique();

            entity.Property(e => e.PlaylistId).HasColumnName("playlist_id");
            entity.Property(e => e.Access)
                .HasColumnType("enum('public','private')")
                .HasColumnName("access");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.Duration)
                .HasColumnType("time")
                .HasColumnName("duration");
            entity.Property(e => e.NumOfSongs).HasColumnName("num_of_songs");
            entity.Property(e => e.PlaylistDescription)
                .HasMaxLength(500)
                .HasColumnName("playlist_description");
            entity.Property(e => e.PlaylistName)
                .HasMaxLength(100)
                .HasColumnName("playlist_name");
            entity.Property(e => e.PlaylistPictureFileId).HasColumnName("playlist_picture_file_id");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.PlaylistDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("playlist_ibfk_2");

            entity.HasOne(d => d.PlaylistPictureFile).WithMany(p => p.Playlists)
                .HasForeignKey(d => d.PlaylistPictureFileId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("playlist_ibfk_3");

            entity.HasOne(d => d.User).WithMany(p => p.PlaylistUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("playlist_ibfk_1");
        });

        modelBuilder.Entity<PlaylistEntry>(entity =>
        {
            entity.HasKey(e => e.PlaylistEntryId).HasName("PRIMARY");

            entity.ToTable("playlist_entry");

            entity.HasIndex(e => e.CreatedBy, "fk_created_by_idx");

            entity.HasIndex(e => e.PlaylistId, "fk_playlist_id");

            entity.HasIndex(e => e.SongId, "fk_song_id");

            entity.HasIndex(e => e.PlaylistEntryId, "playlist_entry_id").IsUnique();

            entity.Property(e => e.PlaylistEntryId).HasColumnName("playlist_entry_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.PlaylistId).HasColumnName("playlist_id");
            entity.Property(e => e.RemovedBy).HasColumnName("removed_by");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.TimeAdded)
                .HasColumnType("datetime")
                .HasColumnName("time_added");
            entity.Property(e => e.TimeRemoved)
                .HasColumnType("datetime")
                .HasColumnName("time_removed");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.PlaylistEntries)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("playlist_entry_ibfk_1");

            entity.HasOne(d => d.Playlist).WithMany(p => p.PlaylistEntries)
                .HasForeignKey(d => d.PlaylistId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_playlist_id");

            entity.HasOne(d => d.Song).WithMany(p => p.PlaylistEntries)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_song_id");
        });

        modelBuilder.Entity<PlaylistPictureFile>(entity =>
        {
            entity.HasKey(e => e.PlaylistPictureFileId).HasName("PRIMARY");

            entity.ToTable("playlist_picture_file");

            entity.Property(e => e.PlaylistPictureFileId).HasColumnName("playlist_picture_file_id");
            entity.Property(e => e.FileData)
                .HasColumnType("mediumblob")
                .HasColumnName("file_data");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(4)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(50)
                .HasColumnName("file_name");
        });

        modelBuilder.Entity<ProfilePictureFile>(entity =>
        {
            entity.HasKey(e => e.ProfilePictureFileId).HasName("PRIMARY");

            entity.ToTable("profile_picture_file");

            entity.Property(e => e.ProfilePictureFileId).HasColumnName("profile_picture_file_id");
            entity.Property(e => e.FileData)
                .HasColumnType("mediumblob")
                .HasColumnName("file_data");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(4)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(50)
                .HasColumnName("file_name");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PRIMARY");

            entity.ToTable("review");

            entity.HasIndex(e => e.AdminId, "admin_id");

            entity.HasIndex(e => e.ComplaintId, "complaint_id");

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.ReviewId, "review_id").IsUnique();

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.ReviewId).HasColumnName("review_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.ComplaintId).HasColumnName("complaint_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDelted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_delted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Admin).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.AdminId)
                .HasConstraintName("review_ibfk_1");

            entity.HasOne(d => d.Complaint).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.ComplaintId)
                .HasConstraintName("review_ibfk_2");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ReviewCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("review_ibfk_3");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.ReviewDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("review_ibfk_5");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.ReviewUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("review_ibfk_4");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.SessionId).HasName("PRIMARY");

            entity.ToTable("session");

            entity.HasIndex(e => e.SessionId, "session_id").IsUnique();

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.SessionId)
                .HasMaxLength(36)
                .HasColumnName("session_id");
            entity.Property(e => e.ExperationTime)
                .HasColumnType("datetime")
                .HasColumnName("experation_time");
            entity.Property(e => e.IssuedAt)
                .HasColumnType("datetime")
                .HasColumnName("issued_at");
            entity.Property(e => e.Revoked).HasColumnName("revoked");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("session_ibfk_1");
        });

        modelBuilder.Entity<Song>(entity =>
        {
            entity.HasKey(e => e.SongId).HasName("PRIMARY");

            entity.ToTable("song");

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.SongFileId, "song_ibfk_4_idx");

            entity.HasIndex(e => e.AlbumId, "song_ibfk_4_idx1");

            entity.HasIndex(e => e.SongId, "song_id").IsUnique();

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.AlbumId).HasColumnName("album_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.Duration)
                .HasColumnType("time")
                .HasColumnName("duration");
            entity.Property(e => e.Lyrics)
                .HasMaxLength(2000)
                .HasColumnName("lyrics");
            entity.Property(e => e.SongFileId).HasColumnName("song_file_id");
            entity.Property(e => e.SongName)
                .HasMaxLength(50)
                .HasColumnName("song_name");
            entity.Property(e => e.Streams).HasColumnName("streams");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.Album).WithMany(p => p.Songs)
                .HasForeignKey(d => d.AlbumId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("song_ibfk_4");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.SongCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("song_ibfk_1");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.Songs)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("song_ibfk_3");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.SongUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("song_ibfk_2");
        });

        modelBuilder.Entity<SongFile>(entity =>
        {
            entity.HasKey(e => e.SongFileId).HasName("PRIMARY");

            entity.ToTable("song_file");

            entity.HasIndex(e => e.MusicianId, "fk_song_file_1_idx");

            entity.HasIndex(e => e.SongId, "fk_song_file_2_idx");

            entity.Property(e => e.SongFileId).HasColumnName("song_file_id");
            entity.Property(e => e.Duration)
                .HasColumnType("time")
                .HasColumnName("duration");
            entity.Property(e => e.FileData)
                .HasColumnType("mediumblob")
                .HasColumnName("file_data");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(4)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(50)
                .HasColumnName("file_name");
            entity.Property(e => e.MusicianId).HasColumnName("musician_id");
            entity.Property(e => e.SongId).HasColumnName("song_id");

            entity.HasOne(d => d.Musician).WithMany(p => p.SongFiles)
                .HasForeignKey(d => d.MusicianId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_song_file_1");

            entity.HasOne(d => d.Song).WithMany(p => p.SongFiles)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_song_file_2");
        });

        modelBuilder.Entity<SongGenre>(entity =>
        {
            entity.HasKey(e => e.SongGenreId).HasName("PRIMARY");

            entity.ToTable("song_genre");

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.SongGenreId, "song_genre_id").IsUnique();

            entity.HasIndex(e => e.SongId, "song_id");

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.SongGenreId).HasColumnName("song_genre_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.Genre)
                .HasMaxLength(30)
                .HasColumnName("genre");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.SongGenreCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("song_genre_ibfk_2");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.SongGenres)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("song_genre_ibfk_4");

            entity.HasOne(d => d.Song).WithMany(p => p.SongGenres)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("song_genre_ibfk_1");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.SongGenreUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("song_genre_ibfk_3");
        });

        modelBuilder.Entity<SongLyricist>(entity =>
        {
            entity.HasKey(e => e.SongLyricistId).HasName("PRIMARY");

            entity.ToTable("song_lyricist");

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.SongId, "song_id");

            entity.HasIndex(e => e.SongLyricistId, "song_lyricist_id").IsUnique();

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.SongLyricistId).HasColumnName("song_lyricist_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.LyricistName)
                .HasMaxLength(20)
                .HasColumnName("lyricist_name");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.SongLyricistCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("song_lyricist_ibfk_2");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.SongLyricists)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("song_lyricist_ibfk_4");

            entity.HasOne(d => d.Song).WithMany(p => p.SongLyricists)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("song_lyricist_ibfk_1");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.SongLyricistUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("song_lyricist_ibfk_3");
        });

        modelBuilder.Entity<SongProducer>(entity =>
        {
            entity.HasKey(e => e.SongProducerId).HasName("PRIMARY");

            entity.ToTable("song_producer");

            entity.HasIndex(e => e.CreatedBy, "created_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.SongId, "song_id");

            entity.HasIndex(e => e.SongProducerId, "song_producer_id").IsUnique();

            entity.HasIndex(e => e.UpdatedBy, "updated_by");

            entity.Property(e => e.SongProducerId).HasColumnName("song_producer_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.ProducerName)
                .HasMaxLength(20)
                .HasColumnName("producer_name");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.SongProducerCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("song_producer_ibfk_2");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.SongProducers)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("song_producer_ibfk_4");

            entity.HasOne(d => d.Song).WithMany(p => p.SongProducers)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("song_producer_ibfk_1");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.SongProducerUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("song_producer_ibfk_3");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PRIMARY");

            entity.ToTable("user");

            entity.HasIndex(e => e.AuthenticationInformationId, "authentication_information_id");

            entity.HasIndex(e => e.ProfilePictureFileId, "user_ibfk_2_idx");

            entity.HasIndex(e => e.UserId, "user_id").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.AuthenticationInformationId).HasColumnName("authentication_information_id");
            entity.Property(e => e.Fname)
                .HasMaxLength(20)
                .HasColumnName("fname");
            entity.Property(e => e.Link)
                .HasColumnType("text")
                .HasColumnName("link");
            entity.Property(e => e.Lname)
                .HasMaxLength(20)
                .HasColumnName("lname");
            entity.Property(e => e.MusicianId).HasColumnName("musician_id");
            entity.Property(e => e.ProfilePictureFileId).HasColumnName("profile_picture_file_id");
            entity.Property(e => e.TimeCreated)
                .HasColumnType("timestamp")
                .HasColumnName("time_created");
            entity.Property(e => e.TimeDeleted)
                .HasColumnType("timestamp")
                .HasColumnName("time_deleted");
            entity.Property(e => e.Username)
                .HasMaxLength(20)
                .HasColumnName("username");

            entity.HasOne(d => d.AuthenticationInformationNavigation).WithMany(p => p.Users)
                .HasForeignKey(d => d.AuthenticationInformationId)
                .HasConstraintName("user_ibfk_1");

            entity.HasOne(d => d.ProfilePictureFile).WithMany(p => p.Users)
                .HasForeignKey(d => d.ProfilePictureFileId)
                .HasConstraintName("user_ibfk_2");
        });

        modelBuilder.Entity<UserAttendsEvent>(entity =>
        {
            entity.HasKey(e => e.UserAttendsEventsId).HasName("PRIMARY");

            entity.ToTable("user_attends_event");

            entity.HasIndex(e => e.EventId, "event_id");

            entity.HasIndex(e => e.UserAttendsEventsId, "user_attends_events_id_UNIQUE").IsUnique();

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.UserAttendsEventsId).HasColumnName("user_attends_events_id");
            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.TimeRspv)
                .HasColumnType("datetime")
                .HasColumnName("time_rspv");
            entity.Property(e => e.TimeUnrspv)
                .HasColumnType("datetime")
                .HasColumnName("time_unrspv");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Event).WithMany(p => p.UserAttendsEvents)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_attends_event_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.UserAttendsEvents)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_attends_event_ibfk_1");
        });

        modelBuilder.Entity<UserFollowsUser>(entity =>
        {
            entity.HasKey(e => e.UserFollowsUserId).HasName("PRIMARY");

            entity.ToTable("user_follows_user");

            entity.HasIndex(e => e.Followee, "fk_followee");

            entity.HasIndex(e => e.Follower, "fk_follower");

            entity.HasIndex(e => e.UserFollowsUserId, "follows_id").IsUnique();

            entity.Property(e => e.UserFollowsUserId).HasColumnName("user_follows_user_id");
            entity.Property(e => e.Followee).HasColumnName("followee");
            entity.Property(e => e.Follower).HasColumnName("follower");
            entity.Property(e => e.TimeFollowed)
                .HasColumnType("timestamp")
                .HasColumnName("time_followed");
            entity.Property(e => e.TimeUnfollowed)
                .HasColumnType("timestamp")
                .HasColumnName("time_unfollowed");

            entity.HasOne(d => d.FolloweeNavigation).WithMany(p => p.UserFollowsUserFolloweeNavigations)
                .HasForeignKey(d => d.Followee)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_followee");

            entity.HasOne(d => d.FollowerNavigation).WithMany(p => p.UserFollowsUserFollowerNavigations)
                .HasForeignKey(d => d.Follower)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_follower");
        });

        modelBuilder.Entity<UserFriendsWithUser>(entity =>
        {
            entity.HasKey(e => e.FriendsWithId).HasName("PRIMARY");

            entity.ToTable("user_friends_with_user");

            entity.HasIndex(e => e.FriendeeId, "fk_friendee_id");

            entity.HasIndex(e => e.FrienderId, "fk_friender_id");

            entity.HasIndex(e => e.FriendsWithId, "friends_with_id").IsUnique();

            entity.Property(e => e.FriendsWithId).HasColumnName("friends_with_id");
            entity.Property(e => e.FriendedState)
                .HasColumnType("enum('PENDING','FRIENDS','REJECTED','UNFRIENDED')")
                .HasColumnName("friended_state");
            entity.Property(e => e.FriendeeId).HasColumnName("friendee_id");
            entity.Property(e => e.FrienderId).HasColumnName("friender_id");
            entity.Property(e => e.TimeAccepted)
                .HasColumnType("timestamp")
                .HasColumnName("time_accepted");
            entity.Property(e => e.TimeFriended)
                .HasColumnType("timestamp")
                .HasColumnName("time_friended");
            entity.Property(e => e.TimeUnfriended)
                .HasColumnType("timestamp")
                .HasColumnName("time_unfriended");

            entity.HasOne(d => d.Friendee).WithMany(p => p.UserFriendsWithUserFriendees)
                .HasForeignKey(d => d.FriendeeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_friendee_id");

            entity.HasOne(d => d.Friender).WithMany(p => p.UserFriendsWithUserFrienders)
                .HasForeignKey(d => d.FrienderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_friender_id");
        });

        modelBuilder.Entity<UserIsCollaboratorOfPlaylist>(entity =>
        {
            entity.HasKey(e => e.UserIsCollaboratorOfPlaylistId).HasName("PRIMARY");

            entity.ToTable("user_is_collaborator_of_playlist");

            entity.HasIndex(e => e.PlaylistId, "fk_playlist_id_idx");

            entity.HasIndex(e => e.RemovedBy, "fk_removed_by_idx");

            entity.HasIndex(e => e.UserId, "fk_user_id_idx");

            entity.HasIndex(e => e.UserIsCollaboratorOfPlaylistId, "user_is_collaborator_of_playlist_id").IsUnique();

            entity.Property(e => e.UserIsCollaboratorOfPlaylistId).HasColumnName("user_is_collaborator_of_playlist_id");
            entity.Property(e => e.PlaylistId).HasColumnName("playlist_id");
            entity.Property(e => e.RemovedBy).HasColumnName("removed_by");
            entity.Property(e => e.TimeAdded)
                .HasColumnType("timestamp")
                .HasColumnName("time_added");
            entity.Property(e => e.TimeRemoved)
                .HasColumnType("timestamp")
                .HasColumnName("time_removed");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Playlist).WithMany(p => p.UserIsCollaboratorOfPlaylists)
                .HasForeignKey(d => d.PlaylistId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_is_collaborator_of_playlist_ibfk_2");

            entity.HasOne(d => d.RemovedByNavigation).WithMany(p => p.UserIsCollaboratorOfPlaylistRemovedByNavigations)
                .HasForeignKey(d => d.RemovedBy)
                .HasConstraintName("user_is_collaborator_of_playlist_ibfk_3");

            entity.HasOne(d => d.User).WithMany(p => p.UserIsCollaboratorOfPlaylistUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_is_collaborator_of_playlist_ibfk_1");
        });

        modelBuilder.Entity<UserLikesSong>(entity =>
        {
            entity.HasKey(e => e.UserLikesSongId).HasName("PRIMARY");

            entity.ToTable("user_likes_song");

            entity.HasIndex(e => e.UserLikesSongId, "likes_id").IsUnique();

            entity.Property(e => e.UserLikesSongId).HasColumnName("user_likes_song_id");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.TimeLiked)
                .HasColumnType("datetime")
                .HasColumnName("time_liked");
            entity.Property(e => e.TimeUnliked)
                .HasColumnType("datetime")
                .HasColumnName("time_unliked");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<UserListensToSong>(entity =>
        {
            entity.HasKey(e => e.UserListensToSongId).HasName("PRIMARY");

            entity.ToTable("user_listens_to_song");

            entity.HasIndex(e => e.SongId, "song_id");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.HasIndex(e => e.UserListensToSongId, "user_listens_to_song_id").IsUnique();

            entity.Property(e => e.UserListensToSongId).HasColumnName("user_listens_to_song_id");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.TimeListened)
                .HasColumnType("datetime")
                .HasColumnName("time_listened");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Song).WithMany(p => p.UserListensToSongs)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_listens_to_song_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.UserListensToSongs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_listens_to_song_ibfk_1");
        });

        modelBuilder.Entity<UserRatesSong>(entity =>
        {
            entity.HasKey(e => e.UserRatesSongId).HasName("PRIMARY");

            entity.ToTable("user_rates_song");

            entity.HasIndex(e => e.CommentDeletedBy, "comment_deleted_by");

            entity.HasIndex(e => e.DeletedBy, "deleted_by");

            entity.HasIndex(e => e.SongId, "song_id");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.HasIndex(e => e.UserRatesSongId, "user_rates_song_id").IsUnique();

            entity.Property(e => e.UserRatesSongId).HasColumnName("user_rates_song_id");
            entity.Property(e => e.Comment)
                .HasMaxLength(100)
                .HasColumnName("comment");
            entity.Property(e => e.CommentDeletedBy).HasColumnName("comment_deleted_by");
            entity.Property(e => e.CommentTimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("comment_timestamp_created");
            entity.Property(e => e.CommentTimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("comment_timestamp_deleted");
            entity.Property(e => e.CommentTimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("comment_timestamp_updated");
            entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
            entity.Property(e => e.SongId).HasColumnName("song_id");
            entity.Property(e => e.Stars)
                .HasColumnType("enum('1','2','3','4','5')")
                .HasColumnName("stars");
            entity.Property(e => e.TimestampCreated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_created");
            entity.Property(e => e.TimestampDeleted)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_deleted");
            entity.Property(e => e.TimestampUpdated)
                .HasColumnType("datetime")
                .HasColumnName("timestamp_updated");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.CommentDeletedByNavigation).WithMany(p => p.UserRatesSongCommentDeletedByNavigations)
                .HasForeignKey(d => d.CommentDeletedBy)
                .HasConstraintName("user_rates_song_ibfk_3");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.UserRatesSongDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("user_rates_song_ibfk_4");

            entity.HasOne(d => d.Song).WithMany(p => p.UserRatesSongs)
                .HasForeignKey(d => d.SongId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_rates_song_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.UserRatesSongUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_rates_song_ibfk_1");
        });

        modelBuilder.Entity<UserSavesPlaylist>(entity =>
        {
            entity.HasKey(e => e.UserSavesPlaylistId).HasName("PRIMARY");

            entity.ToTable("user_saves_playlist");

            entity.HasIndex(e => e.UserId, "user_saves_playlist_ibfk_!_idx");

            entity.HasIndex(e => e.PlaylistId, "user_saves_playlist_ibfk_2_idx");

            entity.HasIndex(e => e.UserSavesPlaylistId, "user_saves_playlist_id_UNIQUE").IsUnique();

            entity.Property(e => e.UserSavesPlaylistId).HasColumnName("user_saves_playlist_id");
            entity.Property(e => e.PlaylistId).HasColumnName("playlist_id");
            entity.Property(e => e.TimeSaved)
                .HasColumnType("datetime")
                .HasColumnName("time_saved");
            entity.Property(e => e.TimeUnsaved)
                .HasColumnType("datetime")
                .HasColumnName("time_unsaved");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Playlist).WithMany(p => p.UserSavesPlaylists)
                .HasForeignKey(d => d.PlaylistId)
                .HasConstraintName("user_saves_playlist_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.UserSavesPlaylists)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_saves_playlist_ibfk_!");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
