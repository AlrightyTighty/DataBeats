using backend.Mappers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly ApplicationDBContext _db;

    public EventsController(ApplicationDBContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> List(
        string? search,
        DateTime? from,
        DateTime? to,
        int page = 1,
        int pageSize = 20,
        string sort = "eventTime_desc")
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        // base query
        var q = _db.Events
            .AsNoTracking()
            .Include(e => e.Musician)
            .Where(e => e.TimestampDeleted == null);

        // filters
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = $"%{search}%";
            q = q.Where(e =>
                EF.Functions.Like(e.Title, s) ||
                EF.Functions.Like(e.EventDescription, s) ||
                EF.Functions.Like(e.Musician.MusicianName, s));
        }

        if (from is not null) q = q.Where(e => e.EventTime >= from);
        if (to   is not null) q = q.Where(e => e.EventTime <= to);

        // sorting
        q = sort switch
        {
            "eventTime_asc"  => q.OrderBy(e => e.EventTime),
            "title_asc"      => q.OrderBy(e => e.Title),
            "title_desc"     => q.OrderByDescending(e => e.Title),
            _                => q.OrderByDescending(e => e.EventTime) // default
        };

        var total = await q.CountAsync();

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => e.ToEventDto())    
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(ulong id)
    {
        var e = await _db.Events
            .AsNoTracking()
            .Include(x => x.Musician)
            .FirstOrDefaultAsync(x => x.EventId == id && x.TimestampDeleted == null);

        if (e is null) return NotFound();

        return Ok(e.ToEventDto());
    }
}
