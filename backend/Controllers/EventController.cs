using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
                .FirstOrDefaultAsync(e => e.EventId == id);

            if (evt == null)
                return NotFound("No such Event with id " + id);

            return Ok(evt.ToEventDto());
        }

        // new HttpGet with given route template - route becomes /api/event/by-musician/{musicianId}
        [HttpGet("by-musician/{musicianId}")]
        public async Task<IActionResult> GetByMusician([FromRoute] ulong musicianId)
        {
            var events = await _context.Events                      // access Events table in db using EF core DbContext
                .Where(e => e.MusicianId == musicianId)             // filter to only get events where event's MusicianId == route musicianId
                .Include(e => e.EventPictureFile)                   // load event's image info
                .Include(e => e.Musician)                           // load event's musician host
                .Where(e => e.TimestampDeleted == null)             // exclude deleted albums
                .ToListAsync();                                     // execute query async; var events becomes a list of Event entities after (await) db operation completes

            // events list empty
            if (!events.Any())
                // return http status code 404 (not found) with json body { "message": "..." }
                return NotFound(new { message = "No events found for this musician." });

            // map each Event entity to an DTO (EventDto) using ToEventDto() method defined in EventMapper
            var eventDtos = events.Select(e => e.ToEventDto());
            // return http status code 200 (ok) response with list of event DTOs serialized as JSON
            return Ok(eventDtos);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDto eventDto)
        {
            // Musician must exist
            var musicianExists = await _context.Musicians
                .AnyAsync(m => m.MusicianId == eventDto.MusicianId);
            if (!musicianExists)
                return BadRequest("MusicianId does not exist.");

            if (eventDto.EventPictureFileId == 0)
                return BadRequest("EventPictureFileId is required.");

            // Picture must exist
            var picExists = await _context.EventPictureFiles
                .AnyAsync(p => p.EventPictureFileId == eventDto.EventPictureFileId);
            if (!picExists)
                return BadRequest("EventPictureFileId does not exist.");

            var evt = eventDto.ToEvent();
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

            // Keep current behavior: if a non-zero new picture id is provided, it must exist.
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
