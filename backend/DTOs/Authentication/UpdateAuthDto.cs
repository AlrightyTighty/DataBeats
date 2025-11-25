namespace backend.DTOs.Authentication
{
    public class UpdateAuthDto
    {
        public string? OldPassword { get;set; }
        public string? NewPassword { get; set; }
    }
}
