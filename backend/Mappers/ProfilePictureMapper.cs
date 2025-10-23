using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProfilePictureFile;
using backend.Models;

namespace backend.Mappers
{
    public static class ProfilePictureMapper
    {
        public static ProfilePictureFileDto ToDTO(this ProfilePictureFile file)
        {
            return new ProfilePictureFileDto
            {
                ProfilePictureFileId = file.ProfilePictureFileId,
                FileName = file.FileName,
                FileExtension = file.FileExtension,
                FileData = file.FileData
            };
        }
    }
}