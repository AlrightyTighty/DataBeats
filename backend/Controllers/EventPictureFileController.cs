using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using backend.Models;
using Humanizer;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("/api/event/file")]
    [ApiController]
    public class EventPictureFileController : ControllerBase
    {
        public ApplicationDBContext _context;

        public EventPictureFileController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] ulong id)
        {
            EventPictureFile? eventFile = await _context.EventPictureFiles.FindAsync(id);
            if (eventFile == null)
                return NotFound("No such art file found with id " + id);

            return Ok(eventFile);
        }

        [HttpGet("view/{id}")]
        public async Task<IActionResult> ViewImage(ulong id)
        {
            var picture = await _context.EventPictureFiles.FindAsync(id);
            if (picture == null)
                return NotFound("No such art file found with id " + id);

            var ext = picture.FileExtension?.TrimStart('.')?.ToLowerInvariant();
            string contentType = ext switch
            {
                "png"  => "image/png",
                "jpg"  => "image/jpeg",
                "jpeg" => "image/jpeg",
                "gif"  => "image/gif",
                "webp" => "image/webp",
                _      => "application/octet-stream"
            };

            return File(picture.FileData, contentType, picture.FileName);
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> UploadEventAsync([FromForm] IFormFile file)
        {
            if (!Request.Headers.TryGetValue("X-UserId", out var headerVals) ||
            string.IsNullOrEmpty(headerVals.FirstOrDefault()) ||
            !ulong.TryParse(headerVals.FirstOrDefault(), out var userId))
            {
                return BadRequest("Missing or invalid X-UserId header.");
            }

            var musician = await _context.Musicians.FirstOrDefaultAsync(musician => musician.UserId == userId);

            if (musician == null)
                return Unauthorized("This user does not have an associated musician account. Create one before trying to upload songs.");

            if (file == null || !file.ContentType.StartsWith("image/"))
                return BadRequest("Only image files are accepted.");

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            var ext = Path.GetExtension(file.FileName)?.TrimStart('.').ToLower() ?? "";

            var picture = new EventPictureFile
            {
                FileName = file.FileName.Truncate(50),
                FileExtension = ext,
                FileData = memoryStream.ToArray()
            };

            await _context.EventPictureFiles.AddAsync(picture);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByIdAsync), new { id = picture.EventPictureFileId }, picture);
        }
    }
}