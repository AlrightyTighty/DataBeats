using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin
{
    public class AdminDeleteDto
    {
        [Required]
        public string EntityType { get; set; } = null!;

        [Required]
        public ulong EntityId { get; set; }

        [Required]
        public string Reason { get; set; } = null!;

        public bool ResolveReports { get; set; }
    }
}
