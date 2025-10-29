using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Report;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("/api/report")]
    public class ReportController : ControllerBase
    {
        public ApplicationDBContext _context;

        public ReportController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreateReportAsync([FromBody] CreateReportDto dto)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            Complaint newComplaint = new Complaint
            {
                UserComment = dto.UserComment,
                ComplaintType = dto.ComplaintType,
                ComplaintTargetId = dto.ComplaintTargetId,
                UserId = userId,
                ComplaintReason = dto.ComplaintReason,
                TimeCreated = DateTime.Now
            };

            await _context.Complaints.AddAsync(newComplaint);
            await _context.SaveChangesAsync();

            return Created();
        }

    }
}