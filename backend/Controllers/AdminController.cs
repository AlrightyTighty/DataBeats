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
        public async Task<IActionResult> ReviewReportAsync([FromRoute] ulong id)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            if (await _context.Admins.FirstOrDefaultAsync(admin => admin.UserId == userId) == null)
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
                                                                    TargetId = action.SongId
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
                                                                    TargetId = action.UserId
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
                                                                    TargetId = action.AlbumId
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
                                                                    TargetId = action.PlaylistId
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
                                                                })
                                                                .ToArrayAsync();

            return Ok(songDeletes.Concat(userDeletes).Concat(playlistDeletes).Concat(albumDeletes).Concat(ratingDeletes).Concat(musicianDeletes));
        }
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
    }
}