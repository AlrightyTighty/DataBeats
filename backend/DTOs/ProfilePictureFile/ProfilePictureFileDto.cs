using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.ProfilePictureFile
{
    public class ProfilePictureFileDto
    {
        public ulong ProfilePictureFileId { get; set; }

        public string FileName { get; set; } = null!;

        public string FileExtension { get; set; } = null!;

        public byte[] FileData { get; set; } = null!;
    }
}