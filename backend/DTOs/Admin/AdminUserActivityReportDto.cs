using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Admin
{
    public class AdminUserActivityReportDto
    {
        public ulong UserId { get; set; }
        public string Username { get; set; } = "";
        public bool IsUserDeleted { get; set; }
        public ulong? MusicianId { get; set; }
        public string? MusicianName { get; set; }
        public bool? IsMusicianDeleted { get; set; }

        public DateTime From { get; set; }
        public DateTime To   { get; set; }
        public AdminPlaylistSummaryDto Playlists  { get; set; } = new();
        public AdminAlbumSummaryDto    Albums     { get; set; } = new();
        public AdminSongSummaryDto     Songs      { get; set; } = new();
        public AdminEventSummaryDto    Events     { get; set; } = new();

        public List<AdminUserTimelineEntryDto> Timeline { get; set; } = new();
    }

    public class AdminUserTimelineEntryDto
    {
        public DateTime OccurredAtUtc { get; set; }
        public string EntityType { get; set; } = "";  // playlist/album/song/event
        public string ActionType { get; set; } = "";  // Created, Deleted
        public ulong EntityId { get; set; }
        public string? EntityName { get; set; }       // playlist/album/song/event name
    }
}