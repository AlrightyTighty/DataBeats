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
            var events = await _context.Events.Include(e => e.EventPictureFile)
            .ToListAsync();
            var eventDtos = events.Select(s => s.ToEventDto());

            return Ok(eventDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] ulong id)

        {
            var evt = await _context.Events .Include(e => e.EventPictureFile)
            .FirstOrDefaultAsync(e => e.EventId == id);

            if (evt == null)
            {
                return NotFound("No such Event with id " + id);
            }

            return Ok(evt.ToEventDto());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDto eventDto)
        {
            var musicianExists = await _context.Musicians.AnyAsync(Musician => Musician.MusicianId == eventDto.MusicianId);
            if (!musicianExists)
                return BadRequest("MusicianId does not exist.");
                
            if (eventDto.EventPictureFileId != 0)
            {
                var exists = await _context.EventPictureFiles
                    .AnyAsync(p => p.EventPictureFileId == eventDto.EventPictureFileId);
                if (!exists)
                    return BadRequest("EventPictureFileId does not exist.");
            }
            var evt = eventDto.ToEvent();
            evt.TimestampCreated = DateTime.UtcNow;
             
            await _context.Events.AddAsync(evt);
            await _context.SaveChangesAsync();
            await _context.Entry(evt).Reference(e => e.EventPictureFile).LoadAsync();
            return CreatedAtAction(nameof(GetById), new { id = evt.EventId }, evt.ToEventDto());
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Update([FromRoute] ulong id, [FromBody] UpdateEventDto updateDto)
        {
            var evt = await _context.Events.FirstOrDefaultAsync(x => x.EventId == id);

            if (evt == null)
            {
                return NotFound();
            }

            if (updateDto.EventPictureFileId != 0)
            {
                var picExists = await _context.EventPictureFiles
                    .AnyAsync(p => p.EventPictureFileId == updateDto.EventPictureFileId);
                if (!picExists)
                    return BadRequest("EventPictureFileId does not exist.");
            }

            evt.Title = updateDto.Title;
            evt.EventDescription = updateDto.EventDescription;
            evt.EventPictureFileId = updateDto.EventPictureFileId;
            evt.EventTime = updateDto.EventTime;
            evt.TicketPrice = updateDto.TicketPrice;

            await _context.SaveChangesAsync();
            await _context.Entry(evt).Reference(e => e.EventPictureFile).LoadAsync();
            return Ok(evt.ToEventDto());
        }

        [HttpDelete("{id}")] // soft delete
        public async Task<IActionResult> Delete([FromRoute] ulong id)
        {
            var evt = await _context.Events.FindAsync(id);
            if (evt == null)
            {
                return NotFound();
            }

            evt.TimestampDeleted = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}