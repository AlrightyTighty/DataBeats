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

        // Resolve authenticated user id WITHOUT changing middleware:
        // - Prefer Claims or HttpContext.Items populated by your middleware
        // - Else, fall back to cookie session lookup in DB
        // - Dev-only: allow X-UserId header in DEBUG
        private async Task<ulong?> ResolveUserIdAsync()
        {
            // 1) Claims (middleware)
            var claimVal = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ulong.TryParse(claimVal, out var fromClaims))
                return fromClaims;

            // 2) HttpContext.Items (middleware)
            if (HttpContext.Items.TryGetValue("UserId", out var itemVal) &&
                ulong.TryParse(itemVal?.ToString(), out var fromItems))
                return fromItems;

            // 3) Cookie session lookup (DB) — adjust property names if yours differ
            if (Request.Cookies.TryGetValue("session-id", out var token) && !string.IsNullOrWhiteSpace(token))
            {
                // Minimal assumptions: Session has SessionId (string) and UserId (ulong)
                var session = await _context.Sessions
                    .FirstOrDefaultAsync(s => s.SessionId == token);

                if (session != null)
                    return session.UserId;
            }

#if DEBUG
            // 4) Dev convenience header
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
                if ((playlist.UserIsCollaboratorOfPlaylists?.Any(c => c.UserId == userId.Value) ?? false)) return true;
                return false;
            }

            // Public: any authenticated user
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
        public async Task<IActionResult> GetPlaylistPage([FromRoute] ulong id)
        {
            var userId = await ResolveUserIdAsync();
            if (!userId.HasValue)
                return Unauthorized("Authentication required.");

            var playlist = await _context.Playlists
                .Include(p => p.PlaylistEntries)
                    .ThenInclude(pe => pe.Song) // only Song; no Artist/Album assumptions
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .FirstOrDefaultAsync(p => p.PlaylistId == id && p.TimestampDeleted == null);

            if (playlist == null)
                return NotFound(new { error = "Playlist not found." });

            if (!CanRead(playlist, userId))
                return StatusCode(403, "You do not have access to this playlist.");

            var dto = playlist.ToPlaylistPageDto(userId);
            return Ok(dto);
        }

        // POST /api/playlistpage/{id}/songs   body: { "songId": <ulong> }
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

            // Optional: update simple aggregate if it's an int (not nullable)
            playlist.NumOfSongs = Math.Max(0, playlist.NumOfSongs + 1);

            await _context.SaveChangesAsync();

            var reloaded = await _context.Playlists
                .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                    .ThenInclude(pe => pe.Song)
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .FirstAsync(p => p.PlaylistId == id);

            return Ok(reloaded.ToPlaylistPageDto(userId));
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

            // Optional: adjust aggregate
            playlist.NumOfSongs = Math.Max(0, playlist.NumOfSongs - 1);

            await _context.SaveChangesAsync();

            var reloaded = await _context.Playlists
                .Include(p => p.PlaylistEntries.Where(pe => pe.TimeRemoved == null))
                    .ThenInclude(pe => pe.Song)
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .FirstAsync(p => p.PlaylistId == id);

            return Ok(reloaded.ToPlaylistPageDto(userId));
        }
    }
}
