using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Admin
{
    public class AdminReportDto
    {
        public DateTime From { get; set; }
        public DateTime To   { get; set; }

        public AdminUserSummaryDto      Users      { get; set; } = new();
        public AdminMusicianSummaryDto  Musicians  { get; set; } = new();
        public AdminPlaylistSummaryDto  Playlists  { get; set; } = new();
        public AdminAlbumSummaryDto     Albums     { get; set; } = new();
        public AdminEventSummaryDto     Events     { get; set; } = new();
        public AdminSongSummaryDto      Songs      { get; set; } = new();
    }
}