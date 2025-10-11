using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Song;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("/api/song/file")]
    [ApiController]
    public class SongFileController : ControllerBase
    {
      /*  [HttpPost]
        public IActionResult CreateSongFile(IFormFile file)
        {
            if (file.ContentType != "audio/mpeg")
                return BadRequest();



        }
        
        public async Task UploadBlobToS3Async(Stream blobStream, string s3Key, string contentType)
        {
            var putObjectRequest = new Amazon.S3.Model.PutObjectRequest
            {
                BucketName = ,
                Key = s3Key,
                InputStream = blobStream,
                ContentType = contentType // e.g., "image/jpeg", "application/pdf"
            };

            await _s3Client.PutObjectAsync(putObjectRequest);
        } */
    }
}