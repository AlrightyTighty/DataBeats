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
            string? ownerDisplayName = null)
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
                
                songDtos.Add(new PlaylistSongDto
                {
                    PlaylistEntryId = pe.PlaylistEntryId,
                    SongId = s?.SongId ?? pe.SongId,
                    Title = s?.SongName ?? "(unknown)",
                    ArtistName = primaryArtist,
                    AlbumName = albumName,
                    AlbumArtFileId = albumArtFileId,
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
                        DisplayName = null
                    })
                    .ToList()
            };
        }
    }
}
