using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Admin;
using backend.DTOs.Event;
using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/event")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public EventController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var events = await _context.Events
                .Include(e => e.EventPictureFile)
                .Include(e => e.Musician)
                .Where(e => e.TimestampDeleted == null)
                .ToListAsync();
            var eventDtos = events.Select(s => s.ToEventDto());
            return Ok(eventDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] ulong id)
        {
            var evt = await _context.Events
                .Include(e => e.EventPictureFile)
                .Include(e => e.Musician)
                .Where(e => e.TimestampDeleted == null)
                .FirstOrDefaultAsync(e => e.EventId == id);

            if (evt == null)
                return NotFound("No such Event with id " + id);

            return Ok(evt.ToEventDto());
        }

        [HttpGet("by-musician/{musicianId}")]
        public async Task<IActionResult> GetByMusician([FromRoute] ulong musicianId)
        {
            var events = await _context.Events
                .Where(e => e.MusicianId == musicianId)
                .Include(e => e.EventPictureFile)
                .Include(e => e.Musician)
                .Where(e => e.TimestampDeleted == null)
                .OrderByDescending(e => e.EventTime)
                .ToListAsync();

            if (!events.Any())
                return NotFound(new { message = "No events found for this musician." });

            var eventDtos = events.Select(e => e.ToEventDto());
            return Ok(eventDtos);
        }

        [HttpPost]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> Create([FromBody] CreateEventDto eventDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Request.Headers.TryGetValue("X-UserId", out var headerVals) ||
               string.IsNullOrEmpty(headerVals.FirstOrDefault()) ||
               !ulong.TryParse(headerVals.FirstOrDefault(), out var userId))
            {
                return Unauthorized("Missing or invalid X-UserId header.");
            }

            // Check that this user has a musician account
            var musician = await _context.Musicians
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (musician == null)
            {
                return Unauthorized("User does not have an associated musician account.");
            }

            if (string.IsNullOrWhiteSpace(eventDto.EventLocation))
                return BadRequest("Event Location is required.");

            if (eventDto.EventPictureFileId == 0)
                return BadRequest("EventPictureFileId is required.");

            var picExists = await _context.EventPictureFiles
                .AnyAsync(p => p.EventPictureFileId == eventDto.EventPictureFileId);
            if (!picExists)
                return BadRequest("EventPictureFileId does not exist.");

            // Validate that event time is in the future
            if (eventDto.EventTime <= DateTime.UtcNow)
            {
                return BadRequest("Event date and time must be in the future.");
            }

            var evt = eventDto.ToEvent();
            evt.MusicianId = musician.MusicianId;
            evt.TimestampCreated = DateTime.UtcNow;

            await _context.Events.AddAsync(evt);
            await _context.SaveChangesAsync();
            await _context.Entry(evt).Reference(e => e.EventPictureFile).LoadAsync();
            await _context.Entry(evt).Reference(e => e.Musician).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = evt.EventId }, evt.ToEventDto());
        }


        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Update([FromRoute] ulong id, [FromBody] UpdateEventDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var evt = await _context.Events.FirstOrDefaultAsync(x => x.EventId == id);
            if (evt == null)
                return NotFound();

            if (updateDto.EventPictureFileId.HasValue)
            {
                var picExists = await _context.EventPictureFiles
                    .AnyAsync(p => p.EventPictureFileId == updateDto.EventPictureFileId);
                if (!picExists)
                    return BadRequest("EventPictureFileId does not exist.");
                evt.EventPictureFileId = updateDto.EventPictureFileId.Value;
            }

            if (updateDto.Title != null)
            {
                evt.Title = updateDto.Title;
            }
            if (updateDto.EventDescription != null)
            {
                evt.EventDescription = updateDto.EventDescription;
            }
            if (updateDto.EventLocation != null)
            {
                evt.EventLocation = updateDto.EventLocation;
            }
            if (updateDto.EventTime != null)
            {
                evt.EventTime = updateDto.EventTime.Value;
            }
            if (updateDto.TicketPrice != null)
            {
                evt.TicketPrice = updateDto.TicketPrice.Value;
            }

            await _context.SaveChangesAsync();
            await _context.Entry(evt).Reference(e => e.EventPictureFile).LoadAsync();

            return Ok(evt.ToEventDto());
        }

        [HttpPost("/admin/delete/event/{id}")]
        [EnableCors("AllowSpecificOrigins")]
        public async Task<IActionResult> AdminDeleteByIdAsync([FromRoute] ulong id, [FromBody] AdminDeleteRequest request)
        {
            ulong userId = ulong.Parse(Request.Headers["X-UserId"]!);
            User deletingUser = (await _context.Users.FindAsync(userId))!;
            Event? eventToDelete = await _context.Events.FindAsync(id);

            if (eventToDelete == null || eventToDelete.TimestampDeleted != null)
                return NotFound();

            // ADMIN CHECK
            if (deletingUser.AdminId == null)
                return StatusCode(StatusCodes.Status403Forbidden);

            ulong? adminId = deletingUser.AdminId;

            // RESOLVE ASSOCIATED REPORTS IF REQUESTED
            if (request.ResolveReports)
            {
                var unresolvedComplaints = await _context.Complaints
                    .Include(c => c.Reviews)
                    .Where(c => c.ComplaintType == "EVENT" && c.ComplaintTargetId == id && c.Reviews.Count == 0)
                    .ToListAsync();

                foreach (var complaint in unresolvedComplaints)
                {
                    Review autoReview = new Review
                    {
                        AdminId = adminId.Value,
                        ComplaintId = complaint.ComplaintId,
                        TimestampCreated = DateTime.Now,
                        CreatedBy = userId,
                        ReviewComment = "Automatically resolved after deletion of offending content"
                    };
                    await _context.Reviews.AddAsync(autoReview);
                }
            }

            // CREATE TRACKING ENTITY
            AdminDeletesEvent adminAction = new AdminDeletesEvent
            {
                AdminId = adminId.Value,
                EventId = id,
                DeletedAt = DateTime.Now,
                DeletedBy = userId,
                Reason = request.Reason
            };

            // SAVE TRACKING AND SOFT DELETE
            await _context.AdminDeletesEvents.AddAsync(adminAction);
            eventToDelete.TimestampDeleted = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")] // soft delete
        public async Task<IActionResult> Delete([FromRoute] ulong id)
        {
            var evt = await _context.Events.FindAsync(id);
            if (evt == null)
                return NotFound();

            evt.TimestampDeleted = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}