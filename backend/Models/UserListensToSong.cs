using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class UserListensToSong
{
    public ulong UserListensToSongId { get; set; }

    public ulong UserId { get; set; }

    public ulong SongId { get; set; }

    public DateTime TimeListened { get; set; }

    public virtual Song Song { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
