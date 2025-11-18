using backend.DTOs.Musician;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/musician-report")]
    public class MusicianReportController : ControllerBase
    {
        private readonly MusicianReportService _reportService;
        public MusicianReportController(MusicianReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpPost]
        public async Task<IActionResult> GetMusicianReport([FromBody] MusicianReportRequest request)
        {
            if (request == null || request.MusicianId == 0)
            {
                return BadRequest("MusicianId is required.");
            }

            var response = await _reportService.GetMusicianReportsAsync(request);
            var report = response.Select(r => new MusicianReportResponse
            {
                ReleaseDate = r.ReleaseDate,
                AlbumTitle = r.AlbumTitle,
                SongName = r.SongName,
                Genres = r.Genres,
                AvgRating = r.AvgRating,
                Likes = r.Likes,
                Streams = r.Streams
            });

            return Ok(report);
        }
    }
}