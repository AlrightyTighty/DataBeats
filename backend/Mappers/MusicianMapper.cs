using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Musician;
using backend.Models;

namespace backend.Mappers
{
    public static class MusicianMapper
    {
        public static Musician ToMusicianFromCreateDto(this CreateMusicianDto dto)
        {
            return new Musician
            {
                UserId = dto.UserId,
                MusicianName = dto.MusicianName,
                Bio = dto.Bio,
                ProfilePictureFileId = dto.ProfilePictureFileId,
                Label = dto.Label
            };
        }
        public static MusicianDto ToDto(this Musician musician)
        {
            return new MusicianDto
            {
                MusicianId = musician.MusicianId,
                UserId = musician.UserId,
                MusicianName = musician.MusicianName,
                Bio = musician.Bio,
                Label = musician.Label,
                FollowerCount = musician.FollowerCount,
                ProfilePictureFileId = musician.ProfilePictureFileId
            };
        }
    }
}