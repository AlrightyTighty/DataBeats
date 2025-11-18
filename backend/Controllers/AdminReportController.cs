using System;
using System.Threading.Tasks;
using backend.DTOs.Admin;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/admin/report")]
    public class AdminReportController : ControllerBase
    {
        private readonly IAdminReportService _service;

        public AdminReportController(IAdminReportService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<AdminReportDto>> Get(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var report = await _service.GenerateReportAsync(start, end);
            return Ok(report);
        }

        [HttpGet("user/{userId:ulong}")]
        public async Task<ActionResult<AdminUserActivityReportDto>> GetUser(
            [FromRoute] ulong userId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            if (userId == 0)
                return BadRequest("Invalid user id.");

            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var report = await _service.GetUserReportAsync(userId, start, end);
            return Ok(report);
        }
    }
}