using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("/api/images/profile-picture")]
    [ApiController]
    public class ProfilePictureController : ControllerBase
    {
        private ApplicationDBContext _context;
        public ProfilePictureController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] ulong id)
        {
            ProfilePictureFile? profilePictureFile = (await _context.ProfilePictureFiles.FindAsync(id));
            if (profilePictureFile == null)
                return NotFound();

            return Ok(profilePictureFile);

        }


        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreateProfilePictureAsync(IFormFile file)
        {
            if (file.ContentType != "image/png")
                return new UnsupportedMediaTypeResult();


            using (Stream fileStream = file.OpenReadStream())
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    await fileStream.CopyToAsync(memoryStream);
                    ProfilePictureFile newProfilePictureFile = new ProfilePictureFile
                    {
                        FileName = file.FileName,
                        FileExtension = "png",
                        FileData = memoryStream.ToArray()
                    };

                    _context.ProfilePictureFiles.Add(newProfilePictureFile);
                    await _context.SaveChangesAsync();
                    return CreatedAtAction("GetById", new { id = newProfilePictureFile.ProfilePictureFileId }, newProfilePictureFile.ToDTO());
                }
            }
            

        }
    }
}