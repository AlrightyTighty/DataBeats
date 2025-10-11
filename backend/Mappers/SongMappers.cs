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
        public static SongDTO ToSongDTO(this Song songModel)
        {
            return new SongDTO
            {
                SongId = songModel.SongId,
                SongName = songModel.SongName,
                Lyrics = songModel.Lyrics,
                FilePath = songModel.FilePath,
                Streams = songModel.Streams,
                Duration = songModel.Duration,
                ShareLink = songModel.ShareLink
            };
        }
    }
}