using System;

namespace backend.DTOs.Friend
{
    public class FriendDto
    {
        public ulong FriendsWithId { get; set; }
        public ulong FrienderId { get; set; }
        public ulong FriendeeId { get; set; }
        public DateTime TimeFriended { get; set; }
        public DateTime? TimeAccepted { get; set; }
        public string FriendedState { get; set; } = null!;
    }
}
