using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Admin;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/song")]
    [ApiController]
    public class SongController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public SongController(ApplicationDBContext context)
        {
            _context = context;
        }


        [HttpGet("list")]
        public async Task<IActionResult> List([FromQuery] string? q = null, [FromQuery] int? limit = null)
        {
            int take = Math.Clamp(limit ?? 10, 1, 200);

            var songsQuery = _context.Songs
                .AsNoTracking() //hopefully makes this faster
                .Where(s => s.TimestampDeleted == null) // Exclude deleted songs
                .Include(s => s.Album)
                    .ThenInclude(a => a.AlbumOrSongArtFile)
                .Include(s => s.SongGenres)
                .Include(s => s.MusicianWorksOnSongs)
                    .ThenInclude(mws => mws.Musician)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var qLower = q.Trim().ToLower();
                songsQuery = songsQuery.Where(s => EF.Functions.Like(s.SongName.ToLower(), $"%{qLower}%"));
            }

            // Load data with includes first, then project in-memory
            var songsWithIncludes = await songsQuery
                .OrderBy(s => s.SongName)
                .Take(take)
                .ToListAsync();

            var items = songsWithIncludes
                .Select(s => s.ToSongDTOForStreaming(s.Album.AlbumOrSongArtFileId, s.Album.AlbumTitle))
                .ToArray();

            return Ok(items);
        }

        [HttpGet("{song_id}")]
        public async Task<IActionResult> GetSongById([FromRoute] ulong song_id)
        {
            Song? foundSong = await _context.Songs
                .Where(song => song.TimestampDeleted == null) // Exclude deleted songs
                
                .Include(song => song.Album)
                
                .Include(song => song.SongGenres)
                .Include(song => song.MusicianWorksOnSongs)
                
                .ThenInclude(worksOn => worksOn.Musician)
                
                .FirstOrDefaultAsync(song => song.SongId == song_id);

            if (foundSong != null)
                return Ok(foundSong.ToSongDTOForStreaming(foundSong.Album.AlbumOrSongArtFileId, foundSong.Album.AlbumTitle));
            else
                return NotFound();
        }

        [HttpGet("genres/by-musician/{musicianId}")]
        public async Task<IActionResult> GetGenresByMusician([FromRoute] ulong musicianId)
        {
            var genres = await _context.SongGenres
                .Where(sg => sg.Song.MusicianWorksOnSongs.Any(mws => mws.MusicianId == musicianId))
                .Where(sg => sg.Song.TimestampDeleted == null)
                .Select(sg => sg.Genre)
                .Distinct()
                .ToListAsync();

            return Ok(genres);
        }

        [HttpPost("/admin/delete/song/{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AdminDeleteByIdAsync([FromRoute] ulong id, [FromBody] AdminDeleteRequest request)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User deletingUser = (await _context.Users.FindAsync(userId))!;
            Song? songToDelete = await _context.Songs.FindAsync(id);

            if (songToDelete == null || songToDelete.TimestampDeleted != null)
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
                    .Where(c => c.ComplaintType == "SONG" && c.ComplaintTargetId == id && c.Reviews.Count == 0)
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
            AdminDeletesSong adminAction = new AdminDeletesSong
            {
                AdminId = adminId.Value,
                SongId = id,
                DeletedAt = DateTime.Now,
                Reason = request.Reason
            };

            // SAVE TRACKING AND SOFT DELETE
            await _context.AdminDeletesSongs.AddAsync(adminAction);
            songToDelete.TimestampDeleted = DateTime.Now;
            await _context.SaveChangesAsync();

            return Created(uri: null as string, adminAction);
        }

        [HttpDelete("{song_id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> DeleteSongById([FromRoute] ulong song_id)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User user = (await _context.Users.FindAsync(userId))!;
            bool isAdmin = user.AdminId != null;

            Song? foundSong = await _context.Songs.FirstOrDefaultAsync(song => song.SongId == song_id && song.TimestampDeleted == null);

            if (foundSong != null)
            {
                // Allow if admin OR creator
                if (!isAdmin && foundSong.CreatedBy != userId)
                    return Forbid();

                foundSong.TimestampDeleted = DateTime.Now;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            else
                return NotFound();
        }
        
        [HttpGet("artist/{musicianId}")]
        public async Task<IActionResult> GetSongsByArtist([FromRoute] ulong musicianId)
        {
            // Load data with includes first, then project in-memory
            var songs = await _context.Songs
                .Where(s => s.TimestampDeleted == null)
                .Where(s =>
                    s.CreatedBy == musicianId ||
                    s.MusicianWorksOnSongs.Any(mws => mws.MusicianId == musicianId)
                )
                .Include(s => s.Album)
                .Include(s => s.SongGenres)
                .Include(s => s.MusicianWorksOnSongs)
                .ThenInclude(mws => mws.Musician)
                .ToListAsync();

            if (!songs.Any())
                return Ok(Array.Empty<object>());

            var dto = songs
                .Select(s => s.ToSongDTOForStreaming(
                    s.Album.AlbumOrSongArtFileId,
                    s.Album.AlbumTitle
                ))
                .ToArray();

            return Ok(dto);
        }
    }
}