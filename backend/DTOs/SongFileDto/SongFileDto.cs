using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.SongfileDto
{
    public class SongFileDtoExcludingData
    {
        public ulong SongFileId { get; set; }
        public string FileName { get; set; } = null!;
        public string FileExtension { get; set; } = null!;
    }

    public class SongFileDto
    {
        public ulong SongFileId { get; set; }
        public string FileName { get; set; } = null!;
        public string FileExtension { get; set; } = null!;

        public byte[] FileData { get; set; } = null!;
    }
}