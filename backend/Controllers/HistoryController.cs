using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using backend.DTOs.History;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

namespace backend.Controllers
{
    [Route("api/history")]
    [ApiController]
    public class HistoryController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        public HistoryController(ApplicationDBContext context) => _context = context;

        private bool TryGetUserId(out ulong userId)
        {
            userId = 0;
            var raw = Request.Headers["X-UserId"].FirstOrDefault();
            return !string.IsNullOrWhiteSpace(raw) && ulong.TryParse(raw, out userId);
        }

        private static string FormatDuration(TimeOnly t) => t.ToTimeSpan().ToString(@"m\:ss");

        private static string CoalesceAlbumTitle(Album? a)
            => (a == null) ? "" :
               (a.GetType().GetProperty("AlbumTitle")?.GetValue(a)?.ToString()
                ?? a.GetType().GetProperty("AlbumName")?.GetValue(a)?.ToString()
                ?? "");

        private static (ulong? id, string name) ChooseArtist(Song s)
        {
            if (s.CreatedByNavigation != null && !string.IsNullOrWhiteSpace(s.CreatedByNavigation.MusicianName))
                return (s.CreatedBy, s.CreatedByNavigation.MusicianName);

            var mw = s.MusicianWorksOnSongs?.FirstOrDefault();
            if (mw?.Musician != null)
                return (mw.Musician.MusicianId, mw.Musician.MusicianName);

            return (null, "");
        }

        [HttpGet("recent")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetRecent(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string? query,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized("Missing X-UserId.");

            page = page <= 0 ? 1 : page;
            pageSize = (pageSize <= 0 || pageSize > 200) ? 25 : pageSize;

            var q = _context.UserListensToSongs
                .AsNoTracking()
                .Where(r => r.UserId == userId)
                .Include(r => r.Song)
                    .ThenInclude(s => s.Album)
                .Include(r => r.Song)
                    .ThenInclude(s => s.CreatedByNavigation)
                .Include(r => r.Song)
                    .ThenInclude(s => s.MusicianWorksOnSongs)
                        .ThenInclude(mws => mws.Musician)
                .Include(r => r.Song)
                    .ThenInclude(s => s.SongGenres)
                .AsQueryable();

            if (from.HasValue) q = q.Where(r => r.TimeListened >= from.Value);
            if (to.HasValue)   q = q.Where(r => r.TimeListened <= to.Value);

            if (!string.IsNullOrWhiteSpace(query))
            {
                var like = query.Trim().ToLower();
                q = q.Where(r =>
                    r.Song.SongName.ToLower().Contains(like) ||
                    (r.Song.CreatedByNavigation != null && r.Song.CreatedByNavigation.MusicianName.ToLower().Contains(like)) ||
                    (r.Song.Album != null && (
                        (EF.Property<string>(r.Song.Album, "AlbumTitle") ?? "").ToLower().Contains(like) ||
                        (EF.Property<string>(r.Song.Album, "AlbumName")  ?? "").ToLower().Contains(like)
                    )) ||
                    r.Song.SongGenres.Any(g => g.Genre.ToLower().Contains(like))
                );
            }

            var total = await q.CountAsync();

            var items = await q
                .OrderByDescending(r => r.TimeListened)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new
                {
                    r.Song.SongId,
                    r.Song.SongName,
                    r.Song.Duration,
                    r.Song.AlbumId,
                    Album = r.Song.Album,
                    ArtistCreatedBy = r.Song.CreatedByNavigation,
                    MW = r.Song.MusicianWorksOnSongs.Select(m => m.Musician).FirstOrDefault(),
                    Genres = r.Song.SongGenres.Select(sg => sg.Genre),
                    r.TimeListened
                })
                .ToListAsync();

            var mapped = items.Select(x =>
            {
                ulong? artistId;
                string artistName;

                if (x.ArtistCreatedBy != null)
                {
                    artistId = x.ArtistCreatedBy.MusicianId;
                    artistName = x.ArtistCreatedBy.MusicianName;
                }
                else
                {
                    artistId = x.MW?.MusicianId;
                    artistName = x.MW?.MusicianName ?? "";
                }

                return new HistoryPlayDto
                {
                    SongId = x.SongId,
                    SongName = x.SongName,
                    Duration = FormatDuration(x.Duration),
                    ArtistId = artistId,
                    ArtistName = artistName,
                    AlbumId = x.AlbumId,
                    AlbumTitle = CoalesceAlbumTitle(x.Album),
                    Genres = x.Genres,
                    PlayedAtUtc = x.TimeListened
                };
            }).ToList();

            return Ok(new { total, page, pageSize, items = mapped });
        }

        [HttpGet("top-songs")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetTopSongs(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string? query,
            [FromQuery] int limit = 25)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized("Missing X-UserId.");
            limit = (limit <= 0 || limit > 200) ? 25 : limit;

            var q = _context.UserListensToSongs
                .AsNoTracking()
                .Where(r => r.UserId == userId)
                .Include(r => r.Song).ThenInclude(s => s.Album)
                .Include(r => r.Song).ThenInclude(s => s.CreatedByNavigation)
                .Include(r => r.Song).ThenInclude(s => s.MusicianWorksOnSongs).ThenInclude(m => m.Musician)
                .Include(r => r.Song).ThenInclude(s => s.SongGenres)
                .AsQueryable();

            if (from.HasValue) q = q.Where(r => r.TimeListened >= from.Value);
            if (to.HasValue)   q = q.Where(r => r.TimeListened <= to.Value);

            if (!string.IsNullOrWhiteSpace(query))
            {
                var like = query.Trim().ToLower();
                q = q.Where(r =>
                    r.Song.SongName.ToLower().Contains(like) ||
                    (r.Song.CreatedByNavigation != null && r.Song.CreatedByNavigation.MusicianName.ToLower().Contains(like)) ||
                    (r.Song.Album != null && (
                        (EF.Property<string>(r.Song.Album, "AlbumTitle") ?? "").ToLower().Contains(like) ||
                        (EF.Property<string>(r.Song.Album, "AlbumName")  ?? "").ToLower().Contains(like)
                    )) ||
                    r.Song.SongGenres.Any(g => g.Genre.ToLower().Contains(like))
                );
            }

            var grouped = await q
                .GroupBy(r => r.SongId)
                .Select(g => new
                {
                    SongId = g.Key,
                    PlayCount = g.Count(),
                    FirstPlayed = g.Min(z => z.TimeListened),
                    LastPlayed  = g.Max(z => z.TimeListened),
                    AnySong     = g.Select(z => z.Song).FirstOrDefault()
                })
                .OrderByDescending(x => x.PlayCount)
                .ThenByDescending(x => x.LastPlayed)
                .Take(limit)
                .ToListAsync();

            var items = grouped
                .Where(x => x.AnySong != null)
                .Select(x =>
                {
                    var s = x.AnySong!;
                    var (artistId, artistName) = ChooseArtist(s);
                    return new TopSongDto
                    {
                        SongId = s.SongId,
                        SongName = s.SongName,
                        Duration = FormatDuration(s.Duration),
                        ArtistId = artistId,
                        ArtistName = artistName,
                        AlbumId = s.AlbumId,
                        AlbumTitle = CoalesceAlbumTitle(s.Album),
                        Genres = s.SongGenres.Select(g => g.Genre).Distinct(),
                        PlayCount = x.PlayCount,
                        FirstPlayedUtc = x.FirstPlayed,
                        LastPlayedUtc = x.LastPlayed
                    };
                })
                .ToList();

            return Ok(new { items });
        }

        [HttpPost("record")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> Record([FromBody] RecordPlayDto dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized("Missing X-UserId.");

            var song = await _context.Songs.FirstOrDefaultAsync(s => s.SongId == dto.SongId);
            if (song == null) return NotFound("Song not found.");

            var row = new UserListensToSong
            {
                UserId = userId,
                SongId = song.SongId,
                TimeListened = DateTime.UtcNow
            };

            await _context.UserListensToSongs.AddAsync(row);
            await _context.SaveChangesAsync();
            return Ok(new { ok = true });
        }
    }
}