using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Rating;
using backend.Models;

namespace backend.Mappers
{
    public static class RatingMappers
    {
        public static RatingDto ToDTO(this UserRatesSong rating)
        {
            return new RatingDto
            {
                UserRatesSongId = rating.UserRatesSongId,
                UserId = rating.UserId,
                SongId = rating.SongId,
                StarCount = byte.Parse(rating.Stars),
                Comment = rating.Comment,
                Username = rating.User.Username
            };
        }
    }
}