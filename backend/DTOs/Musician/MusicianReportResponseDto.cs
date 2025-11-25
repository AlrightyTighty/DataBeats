namespace backend.DTOs.Musician;
public class MusicianReportResponse
{
    public DateTime ReleaseDate { get; set; }
    public string AlbumTitle { get; set; } = null!;
    public string SongName { get; set; } = null!;
    public string Genres { get; set; } = null!;
    public double? AvgRating { get; set; }
    public long? Likes { get; set; }
    public long? Streams { get; set; }
}
