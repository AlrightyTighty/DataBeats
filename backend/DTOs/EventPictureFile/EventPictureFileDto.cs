namespace backend.DTOs
{
    public record EventPictureFileDto(ulong EventPictureFileId, string FileName, string FileExtension, long Bytes);
}
