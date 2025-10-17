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
    [Route("/api/art")]
    [ApiController]
    public class AlbumOrSongArtFileController : ControllerBase
    {
        public ApplicationDBContext _context;

        public AlbumOrSongArtFileController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute]ulong id)
        {
            AlbumOrSongArtFile? artFile = await _context.AlbumOrSongArtFiles.FindAsync(id);
            if (artFile == null)
                return NotFound("No such art file found with id " + id);

            return Ok(artFile);
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> UploadArtAsync(IFormFile file)
        {
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            Musician? musician = await _context.Musicians.FirstOrDefaultAsync(musician => musician.UserId == userId);

            if (musician == null)
                return Unauthorized("This user does not have an associated musician account. Create one before trying to upload songs.");

            if (file.ContentType != "image/png")
                return BadRequest();

            using (Stream stream = file.OpenReadStream())
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    await stream.CopyToAsync(memoryStream);
                    AlbumOrSongArtFile newFile = new AlbumOrSongArtFile
                    {
                        FileName = file.FileName.Truncate(50),
                        FileExtension = "png",
                        FileData = memoryStream.ToArray(),
                    };

                    await _context.AlbumOrSongArtFiles.AddAsync(newFile);
                    await _context.SaveChangesAsync();

                    return CreatedAtAction("GetById", new {id = newFile.AlbumOrSongArtFileId, sendFileData=false}, newFile);
                }
            };
        }
    }
}