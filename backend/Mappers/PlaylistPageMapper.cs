using System;
using System.Linq;
using System.Collections.Generic;
using backend.DTOs.PlaylistPage;
using backend.Models;

namespace backend.Mappers
{
    public static class PlaylistPageMappers
    {
        public static PlaylistPageDto ToPlaylistPageDto(this Playlist playlist, ulong? currentUserId)
        {
            var isOwner = currentUserId.HasValue && playlist.UserId == currentUserId.Value;

            var collaboratorUserIds = (playlist.UserIsCollaboratorOfPlaylists?
                                        .Select(c => c.UserId)
                                        .ToHashSet() ?? new HashSet<ulong>());

            var isCollaborator = currentUserId.HasValue && collaboratorUserIds.Contains(currentUserId.Value);

            // active entries only
            var activeEntries = (playlist.PlaylistEntries ?? Enumerable.Empty<PlaylistEntry>())
                                .Where(pe => pe.TimeRemoved == null)
                                .ToList();

            var songDtos = new List<PlaylistSongDto>(activeEntries.Count);
            foreach (var pe in activeEntries)
            {
                var s = pe.Song;
                songDtos.Add(new PlaylistSongDto
                {
                    PlaylistEntryId = pe.PlaylistEntryId,
                    SongId = s?.SongId ?? pe.SongId,
                    Title = "(unknown)",       
                    ArtistName = null,           
                    AlbumName = null,
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
                IsOwner = isOwner,
                IsCollaborator = isCollaborator,
                NumOfSongs = songDtos.Count,
                Songs = songDtos,
                Collaborators = (playlist.UserIsCollaboratorOfPlaylists ?? new List<UserIsCollaboratorOfPlaylist>())
                                .Select(c => new CollaboratorDto { UserId = c.UserId, DisplayName = null })
                                .ToList()
            };
        }
    }
}
