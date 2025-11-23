using System;
using System.Collections.Generic;
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
        
        [HttpGet("users/activity")]
        public async Task<ActionResult<AdminUserActivityReportDto>> GetUserActivityByUsername(
            [FromQuery] string username,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("`username` is required.");

            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var report = await _service.GetUserReportByUsernameAsync(username, start, end);
            return Ok(report);
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<AdminUserRowDto>>> GetUsers(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string search = null)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetUsersAsync(start, end, search);
            return Ok(rows);
        }

        [HttpGet("musicians")]
        public async Task<ActionResult<IEnumerable<AdminMusicianRowDto>>> GetMusicians(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string search = null)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetMusiciansAsync(start, end, search);
            return Ok(rows);
        }

        [HttpGet("playlists")]
        public async Task<ActionResult<IEnumerable<AdminPlaylistRowDto>>> GetPlaylists(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string search = null)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetPlaylistsAsync(start, end, search);
            return Ok(rows);
        }

        [HttpGet("albums")]
        public async Task<ActionResult<IEnumerable<AdminAlbumRowDto>>> GetAlbums(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string search = null)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetAlbumsAsync(start, end, search);
            return Ok(rows);
        }

        [HttpGet("events")]
        public async Task<ActionResult<IEnumerable<AdminEventRowDto>>> GetEvents(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string search = null)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetEventsAsync(start, end, search);
            return Ok(rows);
        }

        [HttpGet("songs")]
        public async Task<ActionResult<IEnumerable<AdminSongRowDto>>> GetSongs(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string search = null)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetSongsAsync(start, end, search);
            return Ok(rows);
        }
    }
}