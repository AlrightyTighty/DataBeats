using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.PlaylistPage;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/playlistpage")]
    public class PlaylistPageController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        
        public PlaylistPageController(ApplicationDBContext context)
        {
            _context = context;
        }

        private async Task<ulong?> ResolveUserIdAsync()
        {
            var claimVal = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ulong.TryParse(claimVal, out var fromClaims))
                return fromClaims;

            if (HttpContext.Items.TryGetValue("UserId", out var itemVal) &&
                ulong.TryParse(itemVal?.ToString(), out var fromItems))
                return fromItems;

            if (Request.Cookies.TryGetValue("session-id", out var token) &&
                !string.IsNullOrWhiteSpace(token))
            {
                var session = await _context.Sessions
                    .FirstOrDefaultAsync(s => s.SessionId == token);

                if (session != null)
                    return session.UserId;
            }

#if DEBUG
            if (Request.Headers.TryGetValue("X-UserId", out var hdr) &&
                ulong.TryParse(hdr, out var fromHdr))
                return fromHdr;
#endif

            return null;
        }

        private static bool CanRead(Playlist playlist, ulong? userId)
        {
            if (!userId.HasValue) return false;

            var access = (playlist.Access ?? "private").Trim();
            if (access.Equals("private", StringComparison.OrdinalIgnoreCase))
            {
                if (playlist.UserId == userId.Value) return true;
                if (playlist.UserIsCollaboratorOfPlaylists?.Any(c => c.UserId == userId.Value) ?? false)
                    return true;
                return false;
            }

            return true;
        }

        private static bool CanModify(Playlist playlist, ulong userId)
        {
            if (playlist.UserId == userId) return true;
            return playlist.UserIsCollaboratorOfPlaylists?.Any(c => c.UserId == userId) ?? false;
        }

        // GET /api/playlistpage/{id}
        [HttpGet("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetPlaylistPage(
            [FromRoute] ulong id,
            [FromQuery] bool includeAlbumArt = false,
            [FromQuery] bool includeLikeStatuses = false)
        {
            var userId = await ResolveUserIdAsync();
            if (!userId.HasValue)
                return Unauthorized("Authentication required.");

            var playlist = await _context.Playlists
                .Include(p => p.PlaylistEntries)
                    .ThenInclude(pe => pe.Song)
                        .ThenInclude(s => s.Album)
                            .ThenInclude(a => a.AlbumOrSongArtFile)
                .Include(p => p.PlaylistEntries)
                    .ThenInclude(pe => pe.Song)
                        .ThenInclude(s => s.MusicianWorksOnSongs)
                            .ThenInclude(mws => mws.Musician)
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                    .ThenInclude(c => c.User) // load collaborator usernames
                .Include(p => p.User) // load owner
                .FirstOrDefaultAsync(p => p.PlaylistId == id && p.TimestampDeleted == null);

            if (playlist == null)
                return NotFound(new { error = "Playlist not found." });

            if (!CanRead(playlist, userId))
                return StatusCode(403, "You do not have access to this playlist.");

            var ownerName = await _context.Users
                .Where(u => u.UserId == playlist.UserId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync();
            var dto = playlist.ToPlaylistPageDto(userId, ownerName, includeAlbumArt, includeLikeStatuses, _context);
            return Ok(dto);

        }


        // POST /api/playlistpage/{id}/songs
        [HttpPost("{id}/songs")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AddSong([FromRoute] ulong id, [FromBody] AddSongToPlaylistDto body)
        {
            var userId = await ResolveUserIdAsync();
            if (!userId.HasValue) return Unauthorized("Authentication required.");
            if (body == null || body.SongId == 0) return BadRequest("songId is required.");

            var playlist = await _context.Playlists
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .FirstOrDefaultAsync(p => p.PlaylistId == id && p.TimestampDeleted == null);

            if (playlist == null) return NotFound(new { error = "Playlist not found." });
            if (!CanModify(playlist, userId.Value))
                return StatusCode(403, "You are not allowed to modify this playlist.");

            var song = await _context.Songs
                .FirstOrDefaultAsync(s => s.SongId == body.SongId && s.TimestampDeleted == null);

            if (song == null) return NotFound(new { error = "Song not found." });

            var entry = new PlaylistEntry
            {
                PlaylistId = playlist.PlaylistId,
                SongId = song.SongId,
                TimeAdded = DateTime.UtcNow,
                CreatedBy = userId.Value,
            };

            _context.PlaylistEntries.Add(entry);
            playlist.NumOfSongs = Math.Max(0, playlist.NumOfSongs + 1);

            await _context.SaveChangesAsync();

                var reloaded = await _context.Playlists
                    .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                        .ThenInclude(pe => pe.Song)
                            .ThenInclude(s => s.Album)
                                .ThenInclude(a => a.AlbumOrSongArtFile)
                    .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                        .ThenInclude(pe => pe.Song)
                            .ThenInclude(s => s.MusicianWorksOnSongs)
                                .ThenInclude(mws => mws.Musician)
                    .Include(p => p.UserIsCollaboratorOfPlaylists)
                        .ThenInclude(c => c.User) // load collaborator usernames
                    .Include(p => p.User) // load owner
                    .FirstAsync(p => p.PlaylistId == id);

            // Explicitly load the User if not already loaded
            var ownerName = await _context.Users
                .Where(u => u.UserId == playlist.UserId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync();
    
            return Ok(reloaded.ToPlaylistPageDto(userId, ownerName));
        }

        // DELETE /api/playlistpage/{id}/songs/{songId}
        [HttpDelete("{id}/songs/{songId}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> RemoveSong([FromRoute] ulong id, [FromRoute] ulong songId)
        {
            var userId = await ResolveUserIdAsync();
            if (!userId.HasValue) return Unauthorized("Authentication required.");

            var playlist = await _context.Playlists
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .FirstOrDefaultAsync(p => p.PlaylistId == id && p.TimestampDeleted == null);

            if (playlist == null) return NotFound(new { error = "Playlist not found." });
            if (!CanModify(playlist, userId.Value))
                return StatusCode(403, "You are not allowed to modify this playlist.");

            var entry = await _context.PlaylistEntries
                .Where(pe => pe.PlaylistId == id && pe.SongId == songId && pe.TimeRemoved == null)
                .OrderByDescending(pe => pe.TimeAdded)
                .FirstOrDefaultAsync();

            if (entry == null)
                return NotFound(new { error = "Active entry for this song was not found in the playlist." });

            entry.TimeRemoved = DateTime.UtcNow;
            entry.RemovedBy = userId.Value;
            playlist.NumOfSongs = Math.Max(0, playlist.NumOfSongs - 1);

            await _context.SaveChangesAsync();

                var reloaded = await _context.Playlists
                    .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                        .ThenInclude(pe => pe.Song)
                            .ThenInclude(s => s.Album)
                                .ThenInclude(a => a.AlbumOrSongArtFile)
                    .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                        .ThenInclude(pe => pe.Song)
                            .ThenInclude(s => s.MusicianWorksOnSongs)
                                .ThenInclude(mws => mws.Musician)
                    .Include(p => p.UserIsCollaboratorOfPlaylists)
                        .ThenInclude(c => c.User) // load collaborator usernames
                    .Include(p => p.User) 
                    .FirstAsync(p => p.PlaylistId == id);

            var ownerName = await _context.Users
                .Where(u => u.UserId == playlist.UserId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync();
            var dto = playlist.ToPlaylistPageDto(userId, ownerName);
            return Ok(dto);

        }

        // POST /api/playlistpage/{id}/collaborators
        [HttpPost("{id}/collaborators")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AddCollaborator([FromRoute] ulong id, [FromBody] backend.DTOs.PlaylistPage.AddCollaboratorDto body)
        {
            var userId = await ResolveUserIdAsync();
            if (!userId.HasValue) return Unauthorized("Authentication required.");
            if (body == null || string.IsNullOrWhiteSpace(body.Username)) return BadRequest("Username is required.");

            var playlist = await _context.Playlists
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .FirstOrDefaultAsync(p => p.PlaylistId == id && p.TimestampDeleted == null);
            if (playlist == null) return NotFound(new { error = "Playlist not found." });
            if (playlist.UserId != userId.Value) return StatusCode(403, "Only the owner can add collaborators.");

            var targetUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == body.Username);
            if (targetUser == null) return NotFound(new { error = "User not found." });
            if (targetUser.UserId == playlist.UserId) return BadRequest("Owner is already implicit collaborator.");
            if (playlist.UserIsCollaboratorOfPlaylists.Any(c => c.UserId == targetUser.UserId && c.TimeRemoved == null))
                return BadRequest("User already a collaborator.");

            // Check if the target user is following the playlist owner
            var isFollowing = await _context.UserFollowsUsers
                .AnyAsync(f => f.Follower == targetUser.UserId && 
                              f.Followee == playlist.UserId && 
                              f.TimeUnfollowed == null);
            
            if (!isFollowing)
                return BadRequest($"{targetUser.Username} is not your friend");

            var collab = new UserIsCollaboratorOfPlaylist
            {
                PlaylistId = playlist.PlaylistId,
                UserId = targetUser.UserId,
                TimeAdded = DateTime.UtcNow
            };
            _context.UserIsCollaboratorOfPlaylists.Add(collab);
            await _context.SaveChangesAsync();

            var reloaded = await _context.Playlists
                .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                    .ThenInclude(pe => pe.Song)
                        .ThenInclude(s => s.Album)
                            .ThenInclude(a => a.AlbumOrSongArtFile)
                .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                    .ThenInclude(pe => pe.Song)
                        .ThenInclude(s => s.MusicianWorksOnSongs)
                            .ThenInclude(mws => mws.Musician)
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                    .ThenInclude(c => c.User) // load collaborator usernames
                .Include(p => p.User)
                .FirstAsync(p => p.PlaylistId == id);

            var ownerName = await _context.Users
                .Where(u => u.UserId == playlist.UserId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync();
            return Ok(reloaded.ToPlaylistPageDto(userId, ownerName));
        }

        // DELETE /api/playlistpage/{id}/collaborators/{collaboratorUserId}
        [HttpDelete("{id}/collaborators/{collaboratorUserId}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> RemoveCollaborator([FromRoute] ulong id, [FromRoute] ulong collaboratorUserId)
        {
            var userId = await ResolveUserIdAsync();
            if (!userId.HasValue) return Unauthorized("Authentication required.");

            var playlist = await _context.Playlists
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .FirstOrDefaultAsync(p => p.PlaylistId == id && p.TimestampDeleted == null);
            
            if (playlist == null) return NotFound(new { error = "Playlist not found." });
            if (playlist.UserId != userId.Value) return StatusCode(403, "Only the owner can remove collaborators.");

            var collab = playlist.UserIsCollaboratorOfPlaylists
                .FirstOrDefault(c => c.UserId == collaboratorUserId && c.TimeRemoved == null);
            
            if (collab == null) return NotFound(new { error = "Collaborator not found." });

            collab.TimeRemoved = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var reloaded = await _context.Playlists
                .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                    .ThenInclude(pe => pe.Song)
                        .ThenInclude(s => s.Album)
                            .ThenInclude(a => a.AlbumOrSongArtFile)
                .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                    .ThenInclude(pe => pe.Song)
                        .ThenInclude(s => s.MusicianWorksOnSongs)
                            .ThenInclude(mws => mws.Musician)
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                    .ThenInclude(c => c.User) // load collaborator usernames
                .Include(p => p.User)
                .FirstAsync(p => p.PlaylistId == id);

            var ownerName = await _context.Users
                .Where(u => u.UserId == playlist.UserId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync();
            return Ok(reloaded.ToPlaylistPageDto(userId, ownerName));
        }
    }
}
