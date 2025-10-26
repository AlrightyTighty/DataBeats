using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class SongPath
    {
        public ulong IdSongUpload { get; set; }
        public string Path { get; set; } = null!;
    }
}