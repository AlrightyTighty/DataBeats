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
        public async Task<IActionResult> Create([FromBody] CreatePlaylistDto playlistDto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == playlistDto.UserId);
            if (!userExists)
            {
                return BadRequest("User does not exist.");
            }
            
            var playlist = playlistDto.ToPlaylist();
            await _context.Playlists.AddAsync(playlist);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = playlist.PlaylistId }, playlist.ToPlaylistDto());
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] ulong id, [FromBody] UpdatePlaylistDto updateDto)
        {
            var playlist = await _context.Playlists.FirstOrDefaultAsync(x => x.PlaylistId == id);

            if (playlist == null)
            {
                return NotFound();
            }

            playlist.PlaylistName = updateDto.PlaylistName;
            playlist.PlaylistPic = updateDto.PlaylistPic;
            playlist.PlaylistDescription = updateDto.PlaylistDescription;

            await _context.SaveChangesAsync();
            return Ok(playlist.ToPlaylistDto());
        }

        [HttpPost("{playlistId}/songs/{songId}")]
        public async Task<IActionResult> AddSongToPlaylist([FromRoute] ulong playlistId, [FromRoute] ulong songId)
        {
            var playlist = await _context.Playlists
                .Include(p => p.PlaylistEntries)
                .ThenInclude(pe => pe.Song)
                .FirstOrDefaultAsync(p => p.PlaylistId == playlistId);

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

            playlist.TimestampDeleted = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    
    }
}