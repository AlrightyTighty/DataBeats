using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Song;
using backend.Models;

namespace backend.Mappers
{
    public static class SongMappers
    {
        public static SongDto ToSongDTO(this Song songModel, string albumName = "")
        {
            return new SongDto
            {
                SongId = songModel.SongId,
                SongName = songModel.SongName,
                Lyrics = songModel.Lyrics,
                SongFileId = songModel.SongId,
                Streams = songModel.Streams,
                Duration = songModel.Duration,
                AlbumId = songModel.AlbumId,
                AlbumName = albumName
            };
        }
        
        public static SongDto ToSongDTOForStreaming(this Song songModel, ulong albumArtId, string albumName="")
        {
            return new SongDto
            {
                SongId = songModel.SongId,
                SongName = songModel.SongName,
                Lyrics = songModel.Lyrics,
                SongFileId = songModel.SongId,
                Streams = songModel.Streams,
                Duration = songModel.Duration,
                AlbumId = songModel.AlbumId,
                AlbumName = albumName,
                CreatorId = songModel.CreatedBy,
                ArtistIds = songModel.MusicianWorksOnSongs.Select(worksOn => worksOn.MusicianId).ToArray(),
                ArtistNames = songModel.MusicianWorksOnSongs.Select(worksOn => worksOn.Musician.MusicianName).ToArray(),
                AlbumArtId = albumArtId
            };
        }
    }
}