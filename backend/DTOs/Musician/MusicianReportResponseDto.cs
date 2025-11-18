namespace backend.DTOs.Musician;
public class MusicianReportResponse
{
    public DateTime ReleaseDate { get; set; }
    public string AlbumTitle { get; set; } = null!;
    public string SongName { get; set; } = null!;
    public string Genres { get; set; } = null!;
    public float? AvgRating { get; set; }
    public int? Likes { get; set; }
    public int? Streams { get; set; }
}
