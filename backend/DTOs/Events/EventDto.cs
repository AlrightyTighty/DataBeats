namespace backend.DTOs;

public record EventDto(
    ulong EventId,
    string Title,
    string MusicianName,
    ulong MusicianId,
    string EventPic,
    DateTime EventTime
    // decimal TicketPrice,
    // string? EventDescription,
    // DateTime TimestampCreated
);
