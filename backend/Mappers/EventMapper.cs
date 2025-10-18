using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Event;
using backend.Models;

namespace backend.Mappers
{
    public static class EventMappers                                                                                     
    {
        public static Event ToEvent(this CreateEventDto dto)
        {
            return new Event
            {
                MusicianId = dto.MusicianId,
                Title = dto.Title,
                EventDescription = dto.EventDescription,
                EventTime = dto.EventTime,
                TicketPrice = dto.TicketPrice
            };
        }
        
        public static EventDto ToEventDto(this Event evt)
        {
            return new EventDto
            {
                EventId = evt.EventId,
                MusicianId = evt.MusicianId,
                Title = evt.Title,
                EventDescription = evt.EventDescription,
                EventTime = evt.EventTime,
                TicketPrice = evt.TicketPrice
            };
        }
    }
}