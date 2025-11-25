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

        [HttpPost("reports/{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> ReviewReportAsync([FromRoute] ulong id, [FromBody] string comment)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if ((await _context.Users.FirstOrDefaultAsync(user => user.UserId == userId))!.AdminId == null)
                return NotFound("This page... it's hidden!!!");

            Admin reviewingAdmin = (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId))!;
            Complaint? reviewedComplaint = await _context.Complaints.FirstOrDefaultAsync(complaint => complaint.ComplaintId == id);
            if (reviewedComplaint == null)
                return NotFound("Complaint not found");

            Review complaintReview = new Review
            {
                Admin = reviewingAdmin,
                Complaint = reviewedComplaint,
                TimestampCreated = DateTime.Now,
                CreatedBy = userId,
                ReviewComment = comment,
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
                                                                    TimeStamp = action.DeletedAt!.Value,
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
                                                                    TimeStamp = action.CreatedAt,
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
                                                                    TimeStamp = action.DeletedAt!.Value,
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
                                                                    TargetEntity = "PLAYLIST",
                                                                    TargetId = action.PlaylistId,
                                                                    TimeStamp = action.DeletedAt!.Value,
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
                                                                    TargetEntity = "RATING",
                                                                    TargetId = action.ReviewId,
                                                                    TimeStamp = action.DeletedAt!.Value,
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
                                                                    TargetEntity = "MUSICIAN",
                                                                    TargetId = action.MusicianId,
                                                                    TimeStamp = action.DeletedAt!.Value,
                                                                    Comment = action.Reason
                                                                })
                                                                .ToArrayAsync();
            AdminAction[] eventDeletes = await _context.AdminDeletesEvents
                                                                .Include(action => action.Admin)
                                                                .ThenInclude(admin => admin.User)
                                                                .Select(action => new AdminAction
                                                                {
                                                                    Action = "Delete",
                                                                    AdminId = action.AdminId,
                                                                    AdminName = action.Admin.User.Username,
                                                                    TargetEntity = "EVENT",
                                                                    TargetId = action.EventId,
                                                                    TimeStamp = action.DeletedAt,
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
                                                                    TimeStamp = action.TimestampCreated,
                                                                    Comment = action.ReviewComment
                                                                })
                                                                .ToArrayAsync();

            return Ok(songDeletes.Concat(userDeletes).Concat(playlistDeletes).Concat(albumDeletes).Concat(ratingDeletes).Concat(musicianDeletes).Concat(eventDeletes).Concat(adminReviews).OrderByDescending(action => action.TimeStamp));
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
            SongPopularityReportData[] songs;

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
                        .Join(_context.SongGenres, song => song.SongId, genre => genre.SongId, (song, genre) => new { genre.Genre, song.SongId, song.Streams })
                        .GroupBy(x => new { x.Genre, x.SongId, x.Streams })
                        .Select(g => new { g.Key.Genre, g.Key.SongId, g.Key.Streams })
                        .GroupBy(x => x.Genre)
                        .Select(group => new GenrePopularityReportData
                        {
                            GenreName = group.Key,
                            Streams = group.Sum(x => x.Streams)
                        })
                        .Where(info => info.Streams >= minArtistStreams)
                        .OrderByDescending(info => info.Streams)
                        .Take(50)
                        .ToArrayAsync();

            artists = await artistsBaseQuery
                        .Join(_context.MusicianWorksOnSongs, a => a.MusicianId, sa => sa.MusicianId, (a, sa) => new { a.MusicianName, a.MusicianId, sa.SongId })
                        .Join(_context.Songs, a => a.SongId, s => s.SongId, (a, s) => new { a.MusicianId, a.MusicianName, s.SongId, s.Streams })
                        .GroupBy(x => new { x.MusicianId, x.MusicianName, x.SongId, x.Streams })
                        .Select(g => new { g.Key.MusicianId, g.Key.MusicianName, g.Key.SongId, g.Key.Streams })
                        .GroupJoin(
                            _context.SongGenres,
                            a => a.SongId,
                            s => s.SongId,
                            (a, genres) => new { a.MusicianId, a.MusicianName, a.SongId, a.Streams, Genres = genres.Select(g => g.Genre).ToArray() }
                        )
                        .GroupBy(x => new { x.MusicianId, x.MusicianName })
                        .Select(g => new ArtistPopularityReportData
                        {
                            MusicianId = g.Key.MusicianId,
                            MusicianName = g.Key.MusicianName,
                            Genres = g.SelectMany(x => x.Genres).Distinct().ToArray(),
                            Streams = g.Sum(x => x.Streams)
                        })
                        .Where(info => info.Streams >= minArtistStreams)
                        .OrderByDescending(info => info.Streams)
                        .Take(50)
                        .ToArrayAsync();

            albums = await albumsBaseQuery
                        .Join(_context.Songs, a => a.AlbumId, s => s.AlbumId, (a, s) => new { a.AlbumId, a.AlbumTitle, s.SongId, s.Streams })
                        .GroupBy(x => new { x.AlbumId, x.AlbumTitle, x.SongId, x.Streams })
                        .Select(g => new { g.Key.AlbumId, g.Key.AlbumTitle, g.Key.SongId, g.Key.Streams })
                        .GroupJoin(
                            _context.SongGenres,
                            a => a.SongId,
                            g => g.SongId,
                            (a, genres) => new { a.AlbumId, a.AlbumTitle, a.SongId, a.Streams, Genres = genres.Select(g => g.Genre).ToArray() }
                        )
                        .Join(_context.MusicianWorksOnAlbums, a => a.AlbumId, aa => aa.AlbumId, (a, aa) => new { a.AlbumId, a.AlbumTitle, a.SongId, a.Streams, a.Genres, aa.MusicianId })
                        .Join(_context.Musicians, a => a.MusicianId, m => m.MusicianId, (a, m) => new { a.AlbumId, a.AlbumTitle, a.SongId, a.Streams, a.Genres, m.MusicianName })
                        .GroupBy(x => new { x.AlbumId, x.AlbumTitle })
                        .Select(g => new AlbumPopularityReportData
                        {
                            AlbumName = g.Key.AlbumTitle,
                            AlbumId = g.Key.AlbumId,
                            Genres = g.SelectMany(x => x.Genres).Distinct().ToArray(),
                            Artists = g.Select(x => x.MusicianName).Distinct().ToArray(),
                            Streams = g.Sum(x => x.Streams)
                        })
                        .Where(info => info.Streams >= minArtistStreams)
                        .OrderByDescending(info => info.Streams)
                        .Take(50)
                        .ToArrayAsync();

            songs = await songBaseQuery
                        .Join(_context.Albums, s => s.AlbumId, a => a.AlbumId, (s, a) => new { s.SongId, s.SongName, s.Streams, a.AlbumTitle })
                        .GroupBy(x => new { x.SongId, x.SongName, x.Streams, x.AlbumTitle })
                        .Select(g => new { g.Key.SongId, g.Key.SongName, g.Key.Streams, g.Key.AlbumTitle })
                        .GroupJoin(
                            _context.SongGenres,
                            s => s.SongId,
                            g => g.SongId,
                            (s, genres) => new { s.SongId, s.SongName, s.Streams, s.AlbumTitle, Genres = genres.Select(g => g.Genre).ToArray() }
                        )
                        .Join(_context.MusicianWorksOnSongs, s => s.SongId, ms => ms.SongId, (s, ms) => new { s.SongId, s.SongName, s.Streams, s.AlbumTitle, s.Genres, ms.MusicianId })
                        .Join(_context.Musicians, s => s.MusicianId, m => m.MusicianId, (s, m) => new { s.SongId, s.SongName, s.Streams, s.AlbumTitle, s.Genres, m.MusicianName })
                        .GroupBy(x => new { x.SongId, x.SongName, x.AlbumTitle })
                        .Select(g => new SongPopularityReportData
                        {
                            SongId = g.Key.SongId,
                            SongName = g.Key.SongName,
                            AlbumName = g.Key.AlbumTitle,
                            Genres = g.SelectMany(x => x.Genres).Distinct().ToArray(),
                            Artists = g.Select(x => x.MusicianName).Distinct().ToArray(),
                            Streams = g.First().Streams
                        })
                        .Where(info => info.Streams >= minArtistStreams)
                        .OrderByDescending(info => info.Streams)
                        .Take(50)
                        .ToArrayAsync();


            return Ok(new { GenreReport = genres, artistReport = artists, albumReport = albums, songReport = songs });
        }

        [HttpGet]
        [Route("songReport/{songName}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetSongStreamReportAsync([FromRoute] string songName, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string? username = null, [FromQuery] string orderBy = "desc")
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId) == null)
                return NotFound();

            // Base query for song streams
            var query = _context.UserListensToSongs
                .Include(uls => uls.User)
                .Include(uls => uls.Song)
                .Where(uls => uls.Song.SongName.ToLower() == songName.ToLower())
                .AsQueryable();

            // Filter by username if provided
            if (!string.IsNullOrWhiteSpace(username))
            {
                query = query.Where(uls => uls.User.Username.ToLower() == username.ToLower());
            }

            // Get total count for pagination metadata
            int totalCount = await query.CountAsync();
            int totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            // Apply sorting by time
            query = orderBy.ToLower() == "asc"
                ? query.OrderBy(uls => uls.TimeListened)
                : query.OrderByDescending(uls => uls.TimeListened);

            // Apply pagination and select data
            var streams = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(uls => new SongStreamReportEntry
                {
                    StreamId = uls.UserListensToSongId,
                    Username = uls.User.Username,
                    SongName = uls.Song.SongName,
                    TimeListened = uls.TimeListened
                })
                .ToArrayAsync();

            return Ok(new PaginatedResponse<SongStreamReportEntry>
            {
                Data = streams,
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize
            });
        }

        [HttpGet]
        [Route("songReport")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> GetSongsOverviewReportAsync([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string? artistName = null, [FromQuery] string? albumName = null, [FromQuery] string? genre = null, [FromQuery] string orderBy = "desc")
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId) == null)
                return NotFound();

            // Start with all songs (including soft-deleted)
            var query = _context.Songs
                .Include(s => s.Album)
                .Include(s => s.SongGenres)
                .Include(s => s.MusicianWorksOnSongs)
                    .ThenInclude(mws => mws.Musician)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(genre))
            {
                query = query.Where(s => s.SongGenres.Any(sg => sg.Genre.ToLower() == genre.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(albumName))
            {
                query = query.Where(s => s.Album.AlbumTitle.ToLower() == albumName.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(artistName))
            {
                query = query.Where(s => s.MusicianWorksOnSongs.Any(mws => mws.Musician.MusicianName.ToLower() == artistName.ToLower()));
            }

            // Get total count for pagination metadata
            int totalCount = await query.CountAsync();
            int totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            // Apply sorting by creation time
            query = orderBy.ToLower() == "asc"
                ? query.OrderBy(s => s.TimestampCreated)
                : query.OrderByDescending(s => s.TimestampCreated);

            // Apply pagination and select data
            var songs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new SongOverviewReportEntry
                {
                    SongId = s.SongId,
                    SongName = s.SongName,
                    AlbumName = s.Album.AlbumTitle,
                    Artists = s.MusicianWorksOnSongs.Select(mws => mws.Musician.MusicianName).ToArray(),
                    Genres = s.SongGenres.Select(sg => sg.Genre).ToArray(),
                    TotalStreams = s.Streams
                })
                .ToArrayAsync();

            return Ok(new PaginatedResponse<SongOverviewReportEntry>
            {
                Data = songs,
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize
            });
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

    public class SongPopularityReportData
    {
        public ulong SongId { get; set; }
        public string SongName { get; set; } = null!;
        public string AlbumName { get; set; } = null!;
        public string[] Artists { get; set; } = null!;
        public string[]? Genres { get; set; }
        public int Streams { get; set; }
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

    public class SongStreamReportEntry
    {
        public ulong StreamId { get; set; }
        public string Username { get; set; } = null!;
        public string SongName { get; set; } = null!;
        public DateTime TimeListened { get; set; }
    }

    public class SongOverviewReportEntry
    {
        public ulong SongId { get; set; }
        public string SongName { get; set; } = null!;
        public string AlbumName { get; set; } = null!;
        public string[] Artists { get; set; } = null!;
        public string[] Genres { get; set; } = null!;
        public int TotalStreams { get; set; }
    }

    public class PaginatedResponse<T>
    {
        public T[] Data { get; set; } = null!;
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
}