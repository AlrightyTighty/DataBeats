using System;
using System.Collections.Generic;

namespace backend.Models;

public class Artist
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string? ImageUrl { get; set; }

    public ICollection<Event> Events { get; set; } = new List<Event>();
}