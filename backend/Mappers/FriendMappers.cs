using backend.DTOs.Friend;
using backend.Models;

namespace backend.Mappers
{
    public static class FriendMappers
    {
        public static FriendDto ToFriendDto(this UserFriendsWithUser friend)
        {
            return new FriendDto
            {
                FriendsWithId = friend.FriendsWithId,
                FrienderId = friend.FrienderId,
                FriendeeId = friend.FriendeeId,
                TimeFriended = friend.TimeFriended,
                TimeAccepted = friend.TimeAccepted,
                FriendedState = friend.FriendedState
            };
        }
    }
}
