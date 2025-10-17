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
        public static SongDto ToSongDTO(this Song songModel)
        {
            return new SongDto
            {
                SongId = songModel.SongId,
                SongName = songModel.SongName,
                Lyrics = songModel.Lyrics,
                SongFileId = songModel.SongId,
                Streams = songModel.Streams,
                Duration = songModel.Duration,
            };
        }
    }
}