namespace backend.DTOs.Musician
{
    public class MusicianReportRequest
    {
        // required
        public ulong MusicianId { get; set; }

        // optional filters
        public DateTime? ReleaseDateFrom { get; set; }
        public DateTime? ReleaseDateTo { get; set; }
        public List<ulong>? AlbumIds { get; set; }
        public List<string>? Genres { get; set; }

        // columns to show
        public bool IncludeAvgRating { get; set; } = false;
        public bool IncludeLikes { get; set; } = false;
        public bool IncludeStreams { get; set; } = false;
    }
}