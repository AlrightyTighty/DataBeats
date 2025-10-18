using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Song;
using backend.Mappers;
using backend.Models;
using Humanizer;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NAudio.Lame;
using NAudio.Wave;
using ATL;

using NLayer.NAudioSupport;

namespace backend.Controllers
{
    [Route("/api/song/file")]
    [ApiController]
    public class SongFileController : ControllerBase
    {

        private ApplicationDBContext _context;

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] ulong id, [FromQuery] bool sendFileData = false)
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
            string userIdString = Request.Headers["X-UserId"]!;
            ulong userId = ulong.Parse(userIdString);

            Musician? musician = await _context.Musicians.FirstOrDefaultAsync(musician => musician.UserId == userId);

            if (musician == null)
                return Unauthorized("This user does not have an associated musician account. Create one before trying to upload songs.");

            if (file.ContentType != "audio/mpeg")
                return BadRequest();

            using (Stream stream = file.OpenReadStream())
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {

                    Track track = new Track(stream, "audio/mpeg");
                    TimeSpan duration = TimeSpan.FromMilliseconds(track.DurationMs);

                    stream.Seek(0, SeekOrigin.Begin);
                    await stream.CopyToAsync(memoryStream);

                    SongFile newSongFile = new SongFile
                    {
                        FileName = file.FileName.Truncate(50),
                        FileExtension = "mp3",
                        FileData = memoryStream.ToArray(),
                        MusicianId = musician.MusicianId,
                        Duration = new TimeOnly(duration.Ticks)
                    };

                    _context.SongFiles.Add(newSongFile);
                    await _context.SaveChangesAsync();

                    return CreatedAtAction("GetById", new { id = newSongFile.SongFileId, sendFileData = false }, newSongFile.ToDtoExcludingData());
                }
            };
        }
    }
}