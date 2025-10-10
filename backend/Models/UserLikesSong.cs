using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserLikesSong
{
    public ulong UserLikesSongId { get; set; }

    public ulong UserId { get; set; }

    public ulong SongId { get; set; }

    public DateTime TimeLiked { get; set; }

    public DateTime? TimeUnliked { get; set; }
}
