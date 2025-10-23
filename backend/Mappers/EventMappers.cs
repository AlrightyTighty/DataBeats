using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Mappers;

public static class EventMappers
{
    // Projection for EF queries (server-side)
    public static IQueryable<EventDto> ToEventDto(this IQueryable<Event> q) =>
        q.Select(e => new EventDto(
            e.EventId,
            e.Title,
            e.Musician.MusicianName,   // NOTE: your model uses MusicianName
            e.MusicianId,
            e.EventPic,
            e.EventTime
        ));

    // Mapping for in-memory entity (rarely needed for lists)
    public static EventDto ToEventDto(this Event e) =>
        new(
            e.EventId,
            e.Title,
            e.Musician.MusicianName,
            e.MusicianId,
            e.EventPic,
            e.EventTime

        );
}
