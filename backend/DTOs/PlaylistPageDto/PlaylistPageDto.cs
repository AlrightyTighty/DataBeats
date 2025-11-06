using System;
using System.Collections.Generic;

namespace backend.DTOs.PlaylistPage
{
    public class PlaylistPageDto
    {
        public ulong PlaylistId { get; set; }
        public string PlaylistName { get; set; } = "";
        public string? PlaylistDescription { get; set; }
        public string Access { get; set; } = "private"; // "private" | "public"
        public ulong UserId { get; set; }               // owner user id

        // viewer context
        public bool IsOwner { get; set; }
        public bool IsCollaborator { get; set; }

        public int NumOfSongs { get; set; }          
        public List<PlaylistSongDto> Songs { get; set; } = new();
        public List<CollaboratorDto> Collaborators { get; set; } = new();
    }

    public class PlaylistSongDto
    {
        public ulong SongId { get; set; }
        public string Title { get; set; } = "";
        public string? ArtistName { get; set; }
        public string? AlbumName { get; set; }
        public DateTime TimeAddedUtc { get; set; }
        public ulong? PlaylistEntryId { get; set; }
    }

    public class CollaboratorDto
    {
        public ulong UserId { get; set; }
        public string? DisplayName { get; set; }
    }

    public class AddSongToPlaylistDto
    {
        public ulong SongId { get; set; }
    }
}
