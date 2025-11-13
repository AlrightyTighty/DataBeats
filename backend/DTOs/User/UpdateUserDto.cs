namespace backend.DTOs.User
{
    public class UpdateUserDto
    {
        public string? Username { get; set; }
        public string? Fname { get; set; }
        public string? Lname { get; set; }
        public ulong? ProfilePictureFileId { get; set; }
        public string? Bio { get; set; } 
    }
}
