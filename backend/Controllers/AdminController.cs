using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("/api/admin")]
    public class AdminController : ControllerBase
    {
        private ApplicationDBContext _context;
        public AdminController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("stats")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetStatsAsync()
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId) == null)
                return NotFound();

            Complaint[] complaints = await _context.Complaints.Where(complaint => complaint.TimeCreated > DateTime.Now.AddDays(-6)).ToArrayAsync();
            List<AdminStatPoint> stats = new List<AdminStatPoint>();

            for (int i = 6; i >= 0; i--)
            {
                stats.Add(new AdminStatPoint(DateTime.Now.AddDays(-i).Date.ToShortDateString(), 6 - i));
            }

            foreach (Complaint complaint in complaints)
            {
                Console.WriteLine(complaint.TimeCreated.Date);
                Console.WriteLine((DateTime.Now.Date - complaint.TimeCreated.Date));
                int index = 6 - ((DateTime.Now.Date - complaint.TimeCreated.Date).Days);
                Console.WriteLine(index);
                if (complaint.ComplaintReason == "INAPPROPRIATE")
                    stats[index].INAPPROPRIATE++;
                else if (complaint.ComplaintReason == "HARASSMENT")
                    stats[index].HARASSMENT++;
                else if (complaint.ComplaintReason == "DMCA")
                    stats[index].DMCA++;
                else if (complaint.ComplaintReason == "SPAM")
                    stats[index].SPAM++;
                else if (complaint.ComplaintReason == "IMPERSONATION")
                    stats[index].IMPERSONATION++;
            }

            return Ok(stats);
        }

        [HttpGet]
        [Route("reports")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetReportsAsync()
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId) == null)
                return NotFound();

            Complaint[] complaints = await _context.Complaints.Include(complaint => complaint.Reviews).Where(complaint => complaint.Reviews.Count == 0).ToArrayAsync();
            return Ok(complaints);
        }

        [Route("reports")]
        [HttpPost("{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> ReviewReportAsync([FromRoute] ulong id, [FromBody] string comment)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if ((await _context.Users.FirstOrDefaultAsync(user => user.UserId == userId))!.AdminId == null)
                return NotFound();

            Admin reviewingAdmin = (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId))!;
            Complaint? reviewedComplaint = await _context.Complaints.FirstOrDefaultAsync(complaint => complaint.ComplaintId == id);
            if (reviewedComplaint == null)
                return NotFound();

            Review complaintReview = new Review
            {
                Admin = reviewingAdmin,
                Complaint = reviewedComplaint,
                TimestampCreated = DateTime.Now,
                CreatedByNavigation = reviewingAdmin.User,
                ReviewComment = comment
            };

            await _context.Reviews.AddAsync(complaintReview);
            await _context.SaveChangesAsync();

            return Created();
        }

        [HttpGet]
        [Route("actions")]
        [EnableCors("AllowSpecificOrigins")]

        public async Task<IActionResult> GetAdminActionsAsync()
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId) == null)
                return NotFound();

            AdminAction[] songDeletes = await _context.AdminDeletesSongs
                                                                .Include(action => action.Admin)
                                                                .ThenInclude(admin => admin.User)
                                                                .Select(action => new AdminAction
                                                                {
                                                                    Action = "Delete",
                                                                    AdminId = action.AdminId,
                                                                    AdminName = action.Admin.User.Username,
                                                                    TargetEntity = "SONG",
                                                                    TargetId = action.SongId,
                                                                    Comment = action.Reason
                                                                })
                                                                .ToArrayAsync();
            AdminAction[] userDeletes = await _context.AdminManagesUsers
                                                                .Include(action => action.Admin)
                                                                .ThenInclude(admin => admin.User)
                                                                .Select(action => new AdminAction
                                                                {
                                                                    Action = "Delete",
                                                                    AdminId = action.AdminId,
                                                                    AdminName = action.Admin.User.Username,
                                                                    TargetEntity = "USER",
                                                                    TargetId = action.UserId,
                                                                    Comment = action.Reason
                                                                })
                                                                .ToArrayAsync();
            AdminAction[] albumDeletes = await _context.AdminDeletesAlbums
                                                                .Include(action => action.Admin)
                                                                .ThenInclude(admin => admin.User)
                                                                .Select(action => new AdminAction
                                                                {
                                                                    Action = "Delete",
                                                                    AdminId = action.AdminId,
                                                                    AdminName = action.Admin.User.Username,
                                                                    TargetEntity = "ALBUM",
                                                                    TargetId = action.AlbumId,
                                                                    Comment = action.Reason
                                                                })
                                                                .ToArrayAsync();
            AdminAction[] playlistDeletes = await _context.AdminDeletesPlaylists
                                                                .Include(action => action.Admin)
                                                                .ThenInclude(admin => admin.User)
                                                                .Select(action => new AdminAction
                                                                {
                                                                    Action = "Delete",
                                                                    AdminId = action.AdminId,
                                                                    AdminName = action.Admin.User.Username,
                                                                    TargetEntity = "USER",
                                                                    TargetId = action.PlaylistId,
                                                                    Comment = action.Reason
                                                                })
                                                                .ToArrayAsync();
            AdminAction[] ratingDeletes = await _context.AdminDeletesRatings
                                                                .Include(action => action.Admin)
                                                                .ThenInclude(admin => admin.User)
                                                                .Select(action => new AdminAction
                                                                {
                                                                    Action = "Delete",
                                                                    AdminId = action.AdminId,
                                                                    AdminName = action.Admin.User.Username,
                                                                    TargetEntity = "USER",
                                                                    TargetId = action.ReviewId,
                                                                    Comment = action.Reason
                                                                })
                                                                .ToArrayAsync();
            AdminAction[] musicianDeletes = await _context.AdminDeletesMusicians
                                                                .Include(action => action.Admin)
                                                                .ThenInclude(admin => admin.User)
                                                                .Select(action => new AdminAction
                                                                {
                                                                    Action = "Delete",
                                                                    AdminId = action.AdminId,
                                                                    AdminName = action.Admin.User.Username,
                                                                    TargetEntity = "USER",
                                                                    TargetId = action.MusicianId,
                                                                    Comment = action.Reason
                                                                })
                                                                .ToArrayAsync();

            AdminAction[] adminReviews = await _context.Reviews
                                                                .Include(action => action.Admin!)
                                                                .ThenInclude(admin => admin.User)
                                                                .Select(action => new AdminAction
                                                                {
                                                                    Action = "Reviews",
                                                                    AdminId = action.AdminId ?? 0,
                                                                    AdminName = action.Admin!.User.Username,
                                                                    TargetEntity = "REVIEW",
                                                                    TargetId = action.ReviewId,
                                                                    Comment = action.ReviewComment
                                                                })
                                                                .ToArrayAsync();

            return Ok(songDeletes.Concat(userDeletes).Concat(playlistDeletes).Concat(albumDeletes).Concat(ratingDeletes).Concat(musicianDeletes));
        }

        [HttpGet]
        [Route("generateReport")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GenerateReportAsync([FromQuery] DateTime? from, DateTime? until, int? minAlbumStreams, int? minGenreStreams, int minArtistStreams)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId) == null)
                return NotFound();

            GenrePopularityReportData[] genres;
            ArtistPopularityReportData[] artists;
            AlbumPopularityReportData[] albums;

            IQueryable<Song> songBaseQuery = _context.Songs.Where(song => song.TimestampDeleted == null);
            IQueryable<Musician> artistsBaseQuery = _context.Musicians.Where(musician => musician.TimestampDeleted == null);
            IQueryable<Album> albumsBaseQuery = _context.Albums.Where(album => album.TimestampDeleted == null);

            if (from != null)
            {
                songBaseQuery = songBaseQuery.Where(song => song.TimestampCreated.Date >= from);
                albumsBaseQuery = albumsBaseQuery.Where(album => album.TimestampCreated.Date >= from);
            }

            if (until != null)
            {
                songBaseQuery = songBaseQuery.Where(song => song.TimestampCreated.Date <= until);
                albumsBaseQuery = albumsBaseQuery.Where(album => album.TimestampCreated.Date <= until);
            }

            genres = await songBaseQuery
                        .Join(_context.SongGenres, song => song.SongId, genre => genre.SongId, (song, genre) => new { genre.Genre, song.Streams })
                        .GroupBy(genre => genre.Genre)
                        .Select(group => new GenrePopularityReportData
                        {
                            GenreName = group.Key,
                            Streams = group.Sum(genre => genre.Streams)
                        })
                        .Where(info => info.Streams >= minArtistStreams)
                        .OrderByDescending(info => info.Streams)
                        .Take(50)
                        .ToArrayAsync();

            artists = await artistsBaseQuery
                        .Join(_context.MusicianWorksOnSongs, a => a.MusicianId, sa => sa.MusicianId, (a, sa) => new { a.MusicianName, a.MusicianId, sa.SongId })
                        .Join(_context.Songs, a => a.SongId, s => s.SongId, (a, s) => new { a.MusicianId, a.MusicianName, s.SongId, s.Streams })
                        .GroupJoin(
                            _context.SongGenres,
                            a => a.SongId,
                            s => s.SongId,
                            (a, genres) => new { a, genres }
                        )
                        .SelectMany(
                            x => x.genres.DefaultIfEmpty(),
                            (x, genre) => new { x.a.MusicianId, x.a.MusicianName, Genre = genre != null ? genre.Genre : null, x.a.Streams }
                        )
                        .GroupBy(x => new { x.MusicianId, x.MusicianName })
                        .Select(g => new ArtistPopularityReportData
                        {
                            MusicianId = g.Key.MusicianId,
                            MusicianName = g.Key.MusicianName,
                            Genres = g.Select(x => x.Genre).Where(g => g != null).Distinct().ToArray(),
                            Streams = g.Sum(x => x.Streams)
                        })
                        .Where(info => info.Streams >= minArtistStreams)
                        .OrderByDescending(info => info.Streams)
                        .Take(50)
                        .ToArrayAsync();

            albums = await albumsBaseQuery
                        .Join(_context.Songs, a => a.AlbumId, s => s.AlbumId, (a, s) => new { a.AlbumId, a.AlbumTitle, s.SongId, s.Streams })
                        .GroupJoin(
                            _context.SongGenres,
                            a => a.SongId,
                            g => g.SongId,
                            (a, genres) => new { a, genres }
                        )
                        .SelectMany(
                            x => x.genres.DefaultIfEmpty(),
                            (x, genre) => new { x.a.AlbumId, x.a.AlbumTitle, x.a.Streams, Genre = genre != null ? genre.Genre : null, x.a.SongId }
                        )
                        .Join(_context.MusicianWorksOnAlbums, a => a.AlbumId, aa => aa.AlbumId, (a, aa) => new { a.AlbumId, a.AlbumTitle, a.Streams, a.Genre, a.SongId, aa.MusicianId })
                        .Join(_context.Musicians, a => a.MusicianId, m => m.MusicianId, (a, m) => new { a.AlbumId, a.AlbumTitle, a.Streams, a.Genre, m.MusicianName })
                        .GroupBy(x => new { x.AlbumId, x.AlbumTitle })
                        .Select(g => new AlbumPopularityReportData
                        {
                            AlbumName = g.Key.AlbumTitle,
                            AlbumId = g.Key.AlbumId,
                            Genres = g.Select(x => x.Genre).Where(g => g != null).Distinct().ToArray(),
                            Artists = g.Select(x => x.MusicianName).Distinct().ToArray(),
                            Streams = g.Sum(x => x.Streams)
                        })
                        .Where(info => info.Streams >= minArtistStreams)
                        .OrderByDescending(info => info.Streams)
                        .Take(50)
                        .ToArrayAsync();


            return Ok(new { GenreReport = genres, artistReport = artists, albumReport = albums });
        }
    }

    public class GenrePopularityReportData
    {
        public string GenreName { get; set; } = null!;
        public int Streams { get; set; }
    }

    public class ArtistPopularityReportData
    {
        public string MusicianName { get; set; } = null!;
        public ulong? MusicianId { get; set; }
        public int Streams { get; set; }
        public string[]? Genres { get; set; }
    }

    public class AlbumPopularityReportData
    {
        public string AlbumName { get; set; } = null!;
        public ulong? AlbumId { get; set; }
        public int Streams { get; set; }
        public string[]? Genres { get; set; }
        public string[] Artists { get; set; } = null!;
    }


    public class AdminStatPoint
    {
        public string header { get; set; } = null!;
        public int index { get; set; } = 0;

        public int INAPPROPRIATE { get; set; } = 0;
        public int HARASSMENT { get; set; } = 0;
        public int DMCA { get; set; } = 0;
        public int SPAM { get; set; } = 0;
        public int IMPERSONATION { get; set; } = 0;

        public AdminStatPoint(string header, int index)
        {
            this.header = header;
            this.index = index;
        }
    }

    public class AdminAction
    {
        public string Action { get; set; } = null!;
        public string TargetEntity { get; set; } = null!;
        public ulong TargetId { get; set; }
        public ulong AdminId { get; set; }
        public string AdminName { get; set; } = null!;

        public DateTime TimeStamp { get; set; }

        public string Comment { get; set; } = null!;
    }
}