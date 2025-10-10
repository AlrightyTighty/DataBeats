using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserFriendsWithUser
{
    public ulong FriendsWithId { get; set; }

    public ulong FrienderId { get; set; }

    public ulong FriendeeId { get; set; }

    public DateTime TimeFriended { get; set; }

    public DateTime? TimeAccepted { get; set; }

    public DateTime? TimeUnfriended { get; set; }

    public string FriendedState { get; set; } = null!;

    public virtual User Friendee { get; set; } = null!;

    public virtual User Friender { get; set; } = null!;
}
