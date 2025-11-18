using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Album;
using backend.Models;

namespace backend.Mappers
{
    public static class AlbumMappers
    {
        public static AlbumDto ToDTO(this Album album)
        {
            return new AlbumDto
            {
                AlbumId = album.AlbumId,
                AlbumTitle = album.AlbumTitle,
                ReleaseDate = album.ReleaseDate,
                NumSongs = album.NumSongs,
                Duration = album.Duration,
                AlbumType = album.AlbumType,
                AlbumOrSongArtFileId = album.AlbumOrSongArtFileId,
                CreatedBy = album.CreatedBy,
                Artists = album.MusicianWorksOnAlbums
                                                    .Select(albumArtist => albumArtist.Musician)
                                                    .Select(musician => new ArtistInfo
                                                    {
                                                        ArtistName = musician.MusicianName,
                                                        MusicianId = musician.MusicianId
                                                    })
                                                    .ToArray()
            };
        }

        public static AlbumDto ToDTOWithImageData(this Album album, byte[] imageData)
        {
            AlbumDto dto = album.ToDTO();
            dto.AlbumArtImage = imageData;
            return dto;
        }
    }
}