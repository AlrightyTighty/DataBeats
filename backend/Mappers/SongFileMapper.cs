using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.SongfileDto;
using backend.Models;

namespace backend.Mappers
{
    public static class SongFileMapper
    {
        public static SongFileDtoExcludingData ToDtoExcludingData(this SongFile songFile)
        {
            return new SongFileDtoExcludingData
            {
                FileName = songFile.FileName,
                FileExtension = songFile.FileExtension,
                SongFileId = songFile.SongFileId
            };
        }

        public static SongFileDto ToDto(this SongFile songFile)
        {
            return new SongFileDto
            {
                FileName = songFile.FileName,
                FileExtension = songFile.FileExtension,
                SongFileId = songFile.SongFileId,
                FileData = songFile.FileData
            };
        }
    }
}