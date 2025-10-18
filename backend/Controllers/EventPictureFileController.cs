using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Humanizer;
using Microsoft.AspNetCore.Cors;
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

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> UploadEventAsync(IFormFile file)
        {
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            Musician? musician = await _context.Musicians.FirstOrDefaultAsync(musician => musician.UserId == userId);

            if (musician == null)
                return Unauthorized("This user does not have an associated musician account. Create one before trying to upload songs.");

            if (file == null || !file.ContentType.StartsWith("image/"))
                return BadRequest("Only image files are accepted.");

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            var picture = new EventPictureFile
            {
                FileName = file.FileName.Truncate(50),
                FileExtension = "png",
                FileData = memoryStream.ToArray()
            };

            await _context.EventPictureFiles.AddAsync(picture);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByIdAsync), new { id = picture.EventPictureFileId }, picture);
        }
    }
}