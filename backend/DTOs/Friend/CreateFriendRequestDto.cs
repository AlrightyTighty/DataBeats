using System;
using backend.Models;

namespace backend.DTOs.Friend
{
    public class CreateFriendRequestDto
    {
        public ulong FrienderId { get; set; }
        public ulong FriendeeId { get; set; }

        public UserFriendsWithUser ToUserFriendsWithUser()
        {
            return new UserFriendsWithUser
            {
                FrienderId = FrienderId,
                FriendeeId = FriendeeId,
                TimeFriended = DateTime.UtcNow,
                FriendedState = "Pending"
            };
        }
    }
}
