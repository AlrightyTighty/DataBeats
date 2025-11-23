using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.Admin
{
    public class AdminUserSummaryDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int DeletedUsers { get; set; }

        public int NewUsersInRange { get; set; }
        public int DeletedUsersInRange { get; set; }
    }

    public class AdminUserRowDto
    {
        public string Username { get; set; } = "";
        public DateTime? TimeCreated { get; set; }
        public DateTime? TimeDeleted { get; set; }
        public bool IsDeleted { get; set; }
    }
}