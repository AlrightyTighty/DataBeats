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

        [HttpGet("user/{userId}")]
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

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<AdminUserRowDto>>> GetUsers(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var end = (to?.Date.AddDays(1)) ?? DateTime.UtcNow;    
            var start = (from?.Date) ?? end.AddDays(-30);          

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetUsersAsync(start, end);
            return Ok(rows);
        }

        [HttpGet("musicians")]
        public async Task<ActionResult<IEnumerable<AdminMusicianRowDto>>> GetMusicians(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetMusiciansAsync(start, end);
            return Ok(rows);
        }

        [HttpGet("playlists")]
        public async Task<ActionResult<IEnumerable<AdminPlaylistRowDto>>> GetPlaylists(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetPlaylistsAsync(start, end);
            return Ok(rows);
        }

        [HttpGet("albums")]
        public async Task<ActionResult<IEnumerable<AdminAlbumRowDto>>> GetAlbums(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetAlbumsAsync(start, end);
            return Ok(rows);
        }

        [HttpGet("events")]
        public async Task<ActionResult<IEnumerable<AdminEventRowDto>>> GetEvents(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetEventsAsync(start, end);
            return Ok(rows);
        }

        [HttpGet("songs")]
        public async Task<ActionResult<IEnumerable<AdminSongRowDto>>> GetSongs(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var end = to ?? DateTime.UtcNow;
            var start = from ?? end.AddDays(-30);

            if (start >= end)
                return BadRequest("`from` must be earlier than `to`.");

            var rows = await _service.GetSongsAsync(start, end);
            return Ok(rows);
        }
    }
}