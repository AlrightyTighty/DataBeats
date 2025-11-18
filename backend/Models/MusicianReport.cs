namespace backend.Models
{
    public class MusicianReport
    {
        public string MusicianIds { get; set; } = null!;
        public DateTime ReleaseDate { get; set; }
        public ulong AlbumId { get; set; }
        public string AlbumTitle { get; set; } = null!;
        public string SongName { get; set; } = null!;
        public string Genres { get; set; } = null!;
        public float? AvgRating { get; set; }
        public int? Likes { get; set; }
        public int? Streams { get; set; }
    }
}