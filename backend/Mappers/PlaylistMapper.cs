using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Playlist;
using backend.DTOs.Song;
using backend.Models;

namespace backend.Mappers
{
    public static class PlaylistMappers
    {
        public static Playlist ToPlaylist(this CreatePlaylistDto dto)
        {
            return new Playlist
            {
                UserId = dto.UserId,
                PlaylistName = dto.PlaylistName,
                //PlaylistPic = dto.PlaylistPic ?? "default_pic_url_or_empty_string",
                PlaylistDescription = dto.PlaylistDescription,
                Access = dto.Access ?? "Private"
            };
        }

        public static PlaylistDto ToPlaylistDto(this Playlist playlist)
        {
            return new PlaylistDto
            {
                PlaylistId = playlist.PlaylistId,
                PlaylistName = playlist.PlaylistName,
                //PlaylistPic = playlist.PlaylistPic,
                PlaylistDescription = playlist.PlaylistDescription,
                NumOfSongs = playlist.NumOfSongs,
                Duration = playlist.Duration,
                Access = playlist.Access ?? "Private",
                UserId = playlist.UserId,
                Songs = playlist.PlaylistEntries //access songs through playlistentries
                ?.Select(pe => pe.Song) // get each song
                .Where(s => s != null) //filter
                .Select(s => s!.ToSongDTO()) //map each song to songdto
                .ToList()
            };
        }
    }
}