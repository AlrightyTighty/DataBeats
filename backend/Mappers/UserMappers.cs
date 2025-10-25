using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.User;
using backend.Models;

namespace backend.Mappers
{
    public static class UserMappers
    {
        public static User ToUserFromCreateUserDto(this CreateUserRequestDto dto)
        {
            return new User
            {
                Username = dto.Username,
                TimeCreated = DateTime.Now
            };
        }

        public static AuthenticationInformation ToAuthenticationInformationFromCreateUserDto(this CreateUserRequestDto dto)
        {
            return new AuthenticationInformation
            {
                Email = dto.Email,
                Password = dto.Password
            };
        }

        public static UserDto ToUserDtoFromUser(this User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Fname = user.Fname,
                Lname = user.Lname,
                ProfilePictureFileId = user.ProfilePictureFileId,
                AdminId = user.AdminId,
                MusicianId = user.MusicianId
            };
        }
    }
}