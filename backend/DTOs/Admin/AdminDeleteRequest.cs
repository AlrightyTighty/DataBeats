using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin
{
    public class AdminDeleteRequest
    {
        [Required]
        public string Reason { get; set; } = null!;

        public bool ResolveReports { get; set; }
    }
}
