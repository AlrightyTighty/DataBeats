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
            var now = DateTime.UtcNow;

            return new UserFriendsWithUser
            {
                FrienderId = FrienderId,
                FriendeeId = FriendeeId,
                TimeFriended = now,
                TimeAccepted = now,
                FriendedState = "Accepted"
            };
        }
    }
}
