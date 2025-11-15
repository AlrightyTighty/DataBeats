using System;
using System.Collections.Generic;
using System.Linq;
using backend.DTOs.PlaylistPage;
using backend.Models;

namespace backend.Mappers
{
    public static class PlaylistPageMappers
    {
        public static PlaylistPageDto ToPlaylistPageDto(
            this Playlist playlist,
            ulong? currentUserId,
            string? ownerDisplayName = null,
            bool includeAlbumArt = false,
            bool includeLikeStatuses = false,
            ApplicationDBContext? context = null)
        {
            var isOwner = currentUserId.HasValue && playlist.UserId == currentUserId.Value;

            var collaboratorUserIds =
                (playlist.UserIsCollaboratorOfPlaylists?
                    .Select(c => c.UserId)
                    .ToHashSet() ?? new HashSet<ulong>());

            var isCollaborator = currentUserId.HasValue &&
                                 collaboratorUserIds.Contains(currentUserId.Value);

            var activeEntries = (playlist.PlaylistEntries ?? Enumerable.Empty<PlaylistEntry>())
                                .Where(pe => pe.TimeRemoved == null)
                                .ToList();

            // Get like statuses if requested
            HashSet<ulong>? likedSongIds = null;
            if (includeLikeStatuses && currentUserId.HasValue && context != null)
            {
                var songIds = activeEntries.Select(pe => pe.SongId).ToList();
                likedSongIds = context.UserLikesSongs
                    .Where(uls => uls.UserId == currentUserId.Value
                                  && songIds.Contains(uls.SongId)
                                  && uls.TimeUnliked == null)
                    .Select(uls => uls.SongId)
                    .ToHashSet();
            }

            // Cache album art data if requested
            Dictionary<ulong, string>? albumArtCache = null;
            if (includeAlbumArt)
            {
                albumArtCache = new Dictionary<ulong, string>();
                
                // Get unique album art file IDs
                var artFileIds = activeEntries
                    .Select(pe => pe.Song?.Album?.AlbumOrSongArtFileId)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();

                // Load art files from context if available
                if (context != null && artFileIds.Any())
                {
                    var artFiles = context.AlbumOrSongArtFiles
                        .Where(art => artFileIds.Contains(art.AlbumOrSongArtFileId))
                        .ToList();

                    foreach (var art in artFiles)
                    {
                        var base64 = Convert.ToBase64String(art.FileData);
                        albumArtCache[art.AlbumOrSongArtFileId] = 
                            $"data:image/{art.FileExtension};base64,{base64}";
                    }
                }
            }

            var songDtos = new List<PlaylistSongDto>(activeEntries.Count);
            foreach (var pe in activeEntries)
            {
                var s = pe.Song;
                
                var primaryArtist = s?.MusicianWorksOnSongs?.FirstOrDefault()?.Musician?.MusicianName;
                
                // Get album info
                var album = s?.Album;
                var albumName = album?.AlbumTitle;
                var albumArtFileId = album?.AlbumOrSongArtFileId;
                
                // Format duration
                var duration = s?.Duration.ToString(@"mm\:ss");

                // Get album art data URL if available
                string? albumArtDataUrl = null;
                if (albumArtFileId.HasValue && albumArtCache?.ContainsKey(albumArtFileId.Value) == true)
                {
                    albumArtDataUrl = albumArtCache[albumArtFileId.Value];
                }

                // Check if song is liked
                bool? isLiked = null;
                if (likedSongIds != null && s?.SongId != null)
                {
                    isLiked = likedSongIds.Contains(s.SongId);
                }
                
                songDtos.Add(new PlaylistSongDto
                {
                    PlaylistEntryId = pe.PlaylistEntryId,
                    SongId = s?.SongId ?? pe.SongId,
                    Title = s?.SongName ?? "(unknown)",
                    ArtistName = primaryArtist,
                    AlbumName = albumName,
                    AlbumArtFileId = albumArtFileId,
                    AlbumArtDataUrl = albumArtDataUrl,
                    IsLiked = isLiked,
                    Duration = duration,
                    TimeAddedUtc = pe.TimeAdded
                });
            }

            return new PlaylistPageDto
            {
                PlaylistId = playlist.PlaylistId,
                PlaylistName = playlist.PlaylistName ?? "(untitled)",
                PlaylistDescription = playlist.PlaylistDescription,
                Access = playlist.Access ?? "private",
                UserId = playlist.UserId,
                PlaylistPictureFileId = playlist.PlaylistPictureFileId,

                OwnerDisplayName = ownerDisplayName, 

                IsOwner = isOwner,
                IsCollaborator = isCollaborator,
                NumOfSongs = songDtos.Count,
                Songs = songDtos,
                Collaborators = (playlist.UserIsCollaboratorOfPlaylists ??
                                 new List<UserIsCollaboratorOfPlaylist>())
                    .Where(c => c.TimeRemoved == null)
                    .Select(c => new CollaboratorDto
                    {
                        UserId = c.UserId,
                        DisplayName = c.User?.Username
                    })
                    .ToList()
            };
        }
    }
}
