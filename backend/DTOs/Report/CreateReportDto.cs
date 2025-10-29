using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Report
{
    public class CreateReportDto
    {
        public string UserComment { get; set; } = null!;

        public string ComplaintType { get; set; } = null!;

        public ulong ComplaintTargetId { get; set; }

        public string ComplaintReason { get; set; } = null!;
    }
}