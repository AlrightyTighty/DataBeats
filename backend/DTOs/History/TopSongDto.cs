namespace backend.DTOs.History
{
    public class TopSongDto
    {
        public ulong SongId { get; set; }
        public string SongName { get; set; } = "";
        public string Duration { get; set; } = "";
        public ulong? ArtistId { get; set; }
        public string ArtistName { get; set; } = "";
        public ulong? AlbumId { get; set; }
        public string AlbumTitle { get; set; } = "";
        public IEnumerable<string> Genres { get; set; } = Array.Empty<string>();
        public int PlayCount { get; set; }
        public DateTime FirstPlayedUtc { get; set; }
        public DateTime LastPlayedUtc { get; set; }
    }
}