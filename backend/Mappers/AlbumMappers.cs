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
        public static Album ToAlbumFromCreateDto(this CreateAlbumRequestDto dto)
        {
            return new Album
            {
                AlbumTitle = dto.AlbumTitle,
                AlbumOrSongArtFileId = dto.AlbumOrSongArtFileId,
                NumSongs = dto.NumSongs,
                AlbumType = dto.AlbumType,
            };
        }
    }
}