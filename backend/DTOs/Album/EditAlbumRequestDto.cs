using backend.DTOs.Song;

namespace backend.DTOs
{
    public class EditAlbumRequestDto
    {
        public string AlbumTitle { get; set; } = null!;
        public ulong AlbumOrSongArtFileId { get; set; }
        public string[] ArtistNames { get; set; } = null!;
        public ulong[] SongsToRemove { get; set; } = null!;
        public CreateSongDto[] SongsToAdd { get; set; } = null!;
        public EditSongDto[] SongsToEdit { get; set; } = null!;
    }

    public class EditSongDto
    {
        public ulong SongId { get; set; }
        public CreateSongDto songInfo { get; set; } = null!;
    }
}