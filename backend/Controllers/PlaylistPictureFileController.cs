using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("/api/playlist/picture")]
    public class PlaylistPictureFileController : ControllerBase
    {
        private ApplicationDBContext _context;
        public PlaylistPictureFileController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] ulong id)
        {
            PlaylistPictureFile? profilePictureFile = await _context.PlaylistPictureFiles.FindAsync(id);
            if (profilePictureFile == null)
                return NotFound();

            return Ok(profilePictureFile);

        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreatePlaylistPictureAsync(IFormFile file)
        {
            if (file.ContentType != "image/png")
                return new UnsupportedMediaTypeResult();


            using (Stream fileStream = file.OpenReadStream())
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    await fileStream.CopyToAsync(memoryStream);
                    PlaylistPictureFile newPlaylistPictureFile = new PlaylistPictureFile
                    {
                        FileName = file.FileName,
                        FileExtension = "png",
                        FileData = memoryStream.ToArray(),
                    };

                    _context.PlaylistPictureFiles.Add(newPlaylistPictureFile);
                    await _context.SaveChangesAsync();
                    return CreatedAtAction("GetById", new { id = newPlaylistPictureFile.PlaylistPictureFileId }, newPlaylistPictureFile);
                }
            }


        }
    }
}