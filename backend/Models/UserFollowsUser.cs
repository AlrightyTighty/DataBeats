using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserFollowsUser
{
    public ulong UserFollowsUserId { get; set; }

    public ulong Follower { get; set; }

    public ulong Followee { get; set; }

    public DateTime TimeFollowed { get; set; }

    public DateTime? TimeUnfollowed { get; set; }

    public virtual User FolloweeNavigation { get; set; } = null!;

    public virtual User FollowerNavigation { get; set; } = null!;
}
