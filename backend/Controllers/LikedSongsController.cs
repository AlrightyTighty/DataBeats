using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Mappers; 

namespace backend.Controllers
{
    [Route("api/likes")]
    [ApiController]
    public class LikedSongsController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        private const string LikedPlaylistName = "Your Liked Playlist";

        private const ulong DefaultPlaylistPictureFileId = 31; //should be changed later after we have a proper default image

        public LikedSongsController(ApplicationDBContext context)
        {
            _context = context;
        }

        private ulong GetUserIdFromHeader()
        {
            var userIdHeader = Request.Headers["X-UserId"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(userIdHeader))
            {
                Console.WriteLine("[LikedSongsController] X-UserId header is missing or empty");
                Console.WriteLine($"[LikedSongsController] Available headers: {string.Join(", ", Request.Headers.Keys)}");
                throw new UnauthorizedAccessException("User ID header is missing. Please authenticate.");
            }
            return ulong.Parse(userIdHeader);
        }

        private async Task<Playlist> GetOrCreateLikedPlaylistAsync(ulong userId)
        {
            var liked = await _context.Playlists
                .FirstOrDefaultAsync(p =>
                    p.UserId == userId &&
                    p.PlaylistName == LikedPlaylistName &&
                    p.TimestampDeleted == null);

            if (liked != null) return liked;

            // Verify user exists before creating playlist
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                throw new InvalidOperationException($"User with ID {userId} does not exist");
            }

            var newPlaylist = new Playlist
            {
                UserId = userId,
                PlaylistName = LikedPlaylistName,
                PlaylistDescription = "Songs You Liked",
                Access = "public",
                NumOfSongs = 0,
                TimestampCreated = DateTime.Now,
                Duration = new TimeOnly(0),
                PlaylistPictureFileId = DefaultPlaylistPictureFileId
            };

            _context.Playlists.Add(newPlaylist);
            await _context.SaveChangesAsync();
            return newPlaylist;
        }


        [HttpPost("{songId}/toggle")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> ToggleLike([FromRoute] ulong songId)
        {
            ulong userId = GetUserIdFromHeader();

            // Verify user exists
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return NotFound(new { error = $"User with ID {userId} not found" });
            }

            var song = await _context.Songs
                .FirstOrDefaultAsync(s => s.SongId == songId && s.TimestampDeleted == null);

            if (song == null)
                return NotFound("Song not found.");

            var likedPlaylist = await GetOrCreateLikedPlaylistAsync(userId);

            var likeEntry = await _context.UserLikesSongs
                .Where(uls => uls.UserId == userId && uls.SongId == songId)
                .OrderByDescending(uls => uls.TimeLiked)
                .FirstOrDefaultAsync();

            bool isCurrentlyLiked = likeEntry != null && likeEntry.TimeUnliked == null;

            if (!isCurrentlyLiked)
            {
                // LIKE 
                var newLike = new UserLikesSong
                {
                    UserId = userId,
                    SongId = songId,
                    TimeLiked = DateTime.UtcNow,
                    TimeUnliked = null
                };
                _context.UserLikesSongs.Add(newLike);

                bool alreadyInPlaylist = await _context.PlaylistEntries
                    .AnyAsync(pe =>
                        pe.PlaylistId == likedPlaylist.PlaylistId &&
                        pe.SongId == songId);

                if (!alreadyInPlaylist)
                {
                    var entry = new PlaylistEntry
                    {
                        PlaylistId = likedPlaylist.PlaylistId,
                        SongId = songId,
                        CreatedBy = userId,
                        TimeAdded = DateTime.UtcNow
                    };
                    _context.PlaylistEntries.Add(entry);

                    likedPlaylist.NumOfSongs = Math.Max(0, likedPlaylist.NumOfSongs + 1);
                }

                await _context.SaveChangesAsync();
                return Ok(new { songId, isLiked = true });
            }
            else
            {
                // UNLIKE
                likeEntry.TimeUnliked = DateTime.UtcNow;

                var entry = await _context.PlaylistEntries
                    .FirstOrDefaultAsync(pe =>
                        pe.PlaylistId == likedPlaylist.PlaylistId &&
                        pe.SongId == songId);

                if (entry != null)
                {
                    _context.PlaylistEntries.Remove(entry);
                    likedPlaylist.NumOfSongs = Math.Max(0, likedPlaylist.NumOfSongs - 1);
                }

                await _context.SaveChangesAsync();
                return Ok(new { songId, isLiked = false });
            }
        }


        [HttpGet("playlist")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetLikedPlaylist()
        {
            ulong userId = GetUserIdFromHeader();

            var likedPlaylist = await GetOrCreateLikedPlaylistAsync(userId);

            var playlist = await _context.Playlists
                .Include(p => p.PlaylistEntries)
                .ThenInclude(pe => pe.Song)
                .FirstAsync(p => p.PlaylistId == likedPlaylist.PlaylistId);

            return Ok(playlist.ToPlaylistDto());
        }

        // Returns like status for a batch of songIds for the current user
        // GET api/likes/status?songIds=1,2,3
        [HttpGet("status")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetLikeStatuses([FromQuery] string songIds)
        {
            if (string.IsNullOrWhiteSpace(songIds))
            {
                return BadRequest(new { error = "songIds query parameter is required" });
            }

            ulong userId = GetUserIdFromHeader();

            // Parse and validate songIds
            var idList = songIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => ulong.TryParse(s, out var id) ? (ulong?)id : null)
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .ToList();

            if (idList.Count == 0)
            {
                return BadRequest(new { error = "No valid songIds provided" });
            }

            var likedIds = await _context.UserLikesSongs
                .Where(uls => uls.UserId == userId
                              && idList.Contains(uls.SongId)
                              && uls.TimeUnliked == null)
                .Select(uls => uls.SongId)
                .Distinct()
                .ToListAsync();

            var result = likedIds.Select(id => new { songId = id, isLiked = true });
            return Ok(new { likes = result });
        }
    }
}
