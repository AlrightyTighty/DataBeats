using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Admin;
using backend.DTOs.Playlist;
using backend.DTOs.Song;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace backend.Controllers
{
    [Route("api/playlist")]
    [ApiController]
    public class PlaylistController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        private const string LikedPlaylistName = "Your Liked Playlist";
        public PlaylistController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var playlists = await _context.Playlists.ToListAsync();
            var playlistDtos = playlists.Select(p => p.ToPlaylistDto());
            return Ok(playlistDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] ulong id)
        {
            var playlist = await _context.Playlists.FindAsync(id);

            if (playlist == null)
            {
                return NotFound();
            }

            return Ok(playlist.ToPlaylistDto());
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> Create([FromBody] CreatePlaylistDto playlistDto)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);

            if (playlistDto.PlaylistName == LikedPlaylistName)
            {
                return BadRequest("Playlist name reserved.");
            }
            
            var playlist = new Playlist
            {
                UserId = userId,
                PlaylistName = playlistDto.PlaylistName,
                PlaylistDescription = playlistDto.PlaylistDescription,
                Access = playlistDto.Access!,
                NumOfSongs = 0,
                TimestampCreated = DateTime.Now,
                Duration = new TimeOnly(0),
                PlaylistPictureFileId = playlistDto.PlaylistPictureId
            };

            await _context.Playlists.AddAsync(playlist);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = playlist.PlaylistId }, playlist.ToPlaylistDto());
        }

        [HttpPut("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> Update([FromRoute] ulong id, [FromBody] UpdatePlaylistDto updateDto)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);

            var playlist = await _context.Playlists
                                                .Include(playlist => playlist.UserIsCollaboratorOfPlaylists)
                                                .FirstOrDefaultAsync(playlist => playlist.PlaylistId == id && (playlist.UserId == userId || playlist.UserIsCollaboratorOfPlaylists.Any(contributor => contributor.UserId == userId)));

            if (playlist == null)
            {
                return NotFound();
            }

            if (playlist.PlaylistName == LikedPlaylistName)
            {
                return BadRequest("You cannot rename your liked playlist");
            }

            playlist.PlaylistName = updateDto.PlaylistName;
            playlist.PlaylistDescription = updateDto.PlaylistDescription;

            await _context.SaveChangesAsync();
            return Ok(playlist.ToPlaylistDto());
        }

        [HttpPost("{playlistId}/songs/{songId}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AddSongToPlaylist([FromRoute] ulong playlistId, [FromRoute] ulong songId)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            var playlist = await _context.Playlists
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .Include(p => p.PlaylistEntries)
                .ThenInclude(pe => pe.Song)
                .FirstOrDefaultAsync(p => p.PlaylistId == playlistId && (p.UserId == userId || p.UserIsCollaboratorOfPlaylists.Any(collaborator => collaborator.UserId == userId)));

            var song = await _context.Songs
                .FirstOrDefaultAsync(s => s.SongId == songId && s.TimestampDeleted == null);

            if (playlist == null || song == null)
            {
                return NotFound("Playlist or Song not found.");
            }

            if (playlist.PlaylistEntries.Any(pe => pe.SongId == songId))
            {
                return BadRequest("Song already exists in playlist.");
            }

            playlist.PlaylistEntries.Add(new PlaylistEntry
            {
                PlaylistId = playlistId,
                SongId = songId
            });

            await _context.SaveChangesAsync();

            var playlistDto = playlist.ToPlaylistDto();
            return Ok(playlistDto);
        }

        [HttpPost("/admin/delete/playlist/{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AdminDeleteByIdAsync([FromRoute] ulong id, [FromBody] AdminDeleteRequest request)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User deletingUser = (await _context.Users.FindAsync(userId))!;
            Playlist? playlistToDelete = await _context.Playlists.FindAsync(id);

            if (playlistToDelete == null || playlistToDelete.TimestampDeleted != null)
                return NotFound();

            // ADMIN CHECK
            if (deletingUser.AdminId == null)
                return StatusCode(StatusCodes.Status403Forbidden);

            ulong? adminId = deletingUser.AdminId;

            // RESOLVE ASSOCIATED REPORTS IF REQUESTED
            if (request.ResolveReports)
            {
                var unresolvedComplaints = await _context.Complaints
                    .Include(c => c.Reviews)
                    .Where(c => c.ComplaintType == "PLAYLIST" && c.ComplaintTargetId == id && c.Reviews.Count == 0)
                    .ToListAsync();

                foreach (var complaint in unresolvedComplaints)
                {
                    Review autoReview = new Review
                    {
                        AdminId = adminId.Value,
                        ComplaintId = complaint.ComplaintId,
                        TimestampCreated = DateTime.Now,
                        CreatedBy = userId,
                        ReviewComment = "Automatically resolved after deletion of offending content"
                    };
                    await _context.Reviews.AddAsync(autoReview);
                }
            }

            // CREATE TRACKING ENTITY
            AdminDeletesPlaylist adminAction = new AdminDeletesPlaylist
            {
                AdminId = adminId.Value,
                PlaylistId = id,
                DeletedAt = DateTime.Now,
                Reason = request.Reason
            };

            // SAVE TRACKING AND SOFT DELETE
            await _context.AdminDeletesPlaylists.AddAsync(adminAction);
            playlistToDelete.TimestampDeleted = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> Delete([FromRoute] ulong id)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User user = (await _context.Users.FindAsync(userId))!;
            bool isAdmin = user.AdminId != null;

            var playlist = await _context.Playlists.FindAsync(id);
            if (playlist == null)
            {
                return NotFound();
            }

            if (playlist.PlaylistName == LikedPlaylistName)
            {
                return BadRequest("You cannot delete your liked playlist");
            }

            // Allow if admin OR owner
            if (!isAdmin && playlist.UserId != userId)
            {
                return Forbid("Only the playlist owner can delete this playlist");
            }

            playlist.TimestampDeleted = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Route("me")]
        [HttpGet("me")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetUserPlaylistsAsync()
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            var userPlaylists = await _context.Playlists
                .Where(playlist => playlist.UserId == userId && playlist.TimestampDeleted == null)
                .Include(playList => playList.PlaylistPictureFile)
                .Include(playlist => playlist.UserIsCollaboratorOfPlaylists)
                .Select(playlist => new UserPlaylistInformation(
                    playlist.PlaylistId, 
                    playlist.PlaylistName, 
                    playlist.PlaylistPictureFile != null ? playlist.PlaylistPictureFile.FileData : Array.Empty<byte>(),
                    playlist.UserIsCollaboratorOfPlaylists.Any(c => c.TimeRemoved == null) // Check if has active collaborators
                ))
                .ToArrayAsync();

            var collaboratorPlaylists = await _context.Playlists
                .Include(playlist => playlist.UserIsCollaboratorOfPlaylists)
                .Where(playlist => playlist.UserIsCollaboratorOfPlaylists.Any(collaborator => collaborator.UserId == userId && collaborator.TimeRemoved == null) && playlist.TimestampDeleted == null)
                .Include(playList => playList.PlaylistPictureFile)
                .Select(playlist => new UserPlaylistInformation(
                    playlist.PlaylistId, 
                    playlist.PlaylistName, 
                    playlist.PlaylistPictureFile != null ? playlist.PlaylistPictureFile.FileData : Array.Empty<byte>(),
                    false // These are collaborative playlists, not owned
                ))
                .ToArrayAsync();

            var savedPlaylists = await _context.Playlists
                .Include(playlist => playlist.UserSavesPlaylists)
                .Where(playlist => playlist.UserSavesPlaylists.Any(saver => saver.UserId == userId) && playlist.TimestampDeleted == null)
                .Include(playList => playList.PlaylistPictureFile)
                .Select(playlist => new UserPlaylistInformation(
                    playlist.PlaylistId, 
                    playlist.PlaylistName, 
                    playlist.PlaylistPictureFile != null ? playlist.PlaylistPictureFile.FileData : Array.Empty<byte>(),
                    false
                ))
                .ToArrayAsync();

            return Ok(new { 
                OwnedPlaylists = userPlaylists, 
                ContributorPlaylists = collaboratorPlaylists,
                SavedPlaylists = savedPlaylists 
            });
        }

        [HttpGet("user/{userId}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetPlaylistsByUser([FromRoute] ulong userId)
        {
            var playlists = await _context.Playlists
                .Where(p => p.UserId == userId && p.TimestampDeleted == null)
                .Include(p => p.PlaylistPictureFile)
                .Include(p => p.UserIsCollaboratorOfPlaylists)
                .Select(p => new UserPlaylistInformation(
                    p.PlaylistId,
                    p.PlaylistName,
                    p.PlaylistPictureFile != null
                        ? p.PlaylistPictureFile.FileData
                        : Array.Empty<byte>(),
                    p.UserIsCollaboratorOfPlaylists.Any(c => c.TimeRemoved == null)
                ))
                .ToArrayAsync();

            return Ok(playlists);
        }
    }

    public class UserPlaylistInformation
    {
        public ulong PlaylistId { get; set; }
        public string PlaylistTitle { get; set; } = null!;
        public byte[] PlaylistImage { get; set; } = null!;
        public bool HasCollaborators { get; set; }

        public UserPlaylistInformation(ulong id, string title, byte[] image, bool hasCollaborators = false)
        {
            this.PlaylistId = id;
            this.PlaylistTitle = title;
            this.PlaylistImage = image;
            this.HasCollaborators = hasCollaborators;
        }
    }
}