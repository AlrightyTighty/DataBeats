using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Song;
using backend.Mappers;
using backend.Models;
using Humanizer;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("/api/song/file")]
    [ApiController]
    public class SongFileController : ControllerBase
    {

        private ApplicationDBContext _context;

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] ulong id, [FromQuery] bool sendFileData)
        {
            SongFile? songFile = await _context.SongFiles.FindAsync(id);
            if (songFile == null)
                return NotFound();

            if (sendFileData)
                return Ok(songFile.ToDto());
            else
                return Ok(songFile.ToDtoExcludingData());
        }


        public SongFileController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> CreateSongFile(IFormFile file)
        {
            Console.WriteLine(file.ContentType);
            if (file.ContentType != "audio/mpeg")
                return BadRequest();

            using (Stream stream = file.OpenReadStream())
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    await stream.CopyToAsync(memoryStream);
                    SongFile newSongFile = new SongFile
                    {
                        FileName = file.FileName.Truncate(50),
                        FileExtension = "mp3",
                        FileData = memoryStream.ToArray(),
                    };

                    _context.SongFiles.Add(newSongFile);
                    _context.SaveChanges();
                    return CreatedAtAction("GetById", new {id = newSongFile.SongId, sendFileData = false}, newSongFile.ToDtoExcludingData());
                }
            };

                

        }
    }
}