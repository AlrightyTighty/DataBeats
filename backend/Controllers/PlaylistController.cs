using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

            var song = await _context.Songs.FindAsync(songId);

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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] ulong id)
        {
            var playlist = await _context.Playlists.FindAsync(id);
            if (playlist == null)
            {
                return NotFound();
            }

            if (playlist.PlaylistName == LikedPlaylistName)
            {
                return BadRequest("You cannot delete your liked playlist");
            }

            playlist.TimestampDeleted = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Route("me")]
        [HttpGet]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetUserPlaylistsAsync([FromRoute] ulong id)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            UserPlaylistInformation[] userPlaylists = await _context.Playlists
                                                        .Where(playlist => playlist.UserId == userId)
                                                        .Include(playList => playList.PlaylistPictureFile)
                                                        .Select(playlist => new UserPlaylistInformation(playlist.PlaylistId, playlist.PlaylistName, playlist.PlaylistPictureFile.FileData))
                                                        .ToArrayAsync();

            /*UserPlaylistInformation[] collaboratorPlaylists = await _context.Playlists
                                                        .Include(playlist => playlist.UserIsCollaboratorOfPlaylists)
                                                        .Where(playlist => playlist.UserIsCollaboratorOfPlaylists.Any(collaborator => collaborator.UserId == userId))
                                                        .Include(playList => playList.PlaylistPictureFile)
                                                        .Select(playlist => new UserPlaylistInformation(playlist.PlaylistId, playlist.PlaylistName, playlist.PlaylistPictureFile.FileData))
                                                        .ToArrayAsync();*/

            UserPlaylistInformation[] savedPlaylists = await _context.Playlists
                                                        .Include(playlist => playlist.UserSavesPlaylists)
                                                        .Where(playlist => playlist.UserSavesPlaylists.Any(saver => saver.UserId == userId))
                                                        .Include(playList => playList.PlaylistPictureFile)
                                                        .Select(playlist => new UserPlaylistInformation(playlist.PlaylistId, playlist.PlaylistName, playlist.PlaylistPictureFile.FileData))
                                                        .ToArrayAsync();

            return Ok(new { OwnedPlaylists = userPlaylists, SavedPlaylists = savedPlaylists });
        }
    }

    public class UserPlaylistInformation
    {
        public ulong PlaylistId { get; set; }
        public string PlaylistTitle { get; set; } = null!;
        public byte[] PlaylistImage { get; set; } = null!;

        public UserPlaylistInformation(ulong id, string title, byte[] image)
        {
            this.PlaylistId = id;
            this.PlaylistTitle = title;
            this.PlaylistImage = image;
        }
    }
}