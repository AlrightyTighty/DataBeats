using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Email
{
    public ulong EmailId { get; set; }

    public string EmailFrom { get; set; } = null!;

    public string EmailTo { get; set; } = null!;

    public string EmailSubject { get; set; } = null!;

    public string EmailBody { get; set; } = null!;

    public sbyte Sent { get; set; }
}
