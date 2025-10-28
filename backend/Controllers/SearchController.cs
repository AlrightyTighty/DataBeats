using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Song;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("/api/search")]
    public class SearchController : ControllerBase
    {
        private ApplicationDBContext _context;

        public SearchController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSearchResultAsync([FromQuery] string query)
        {
            SearchResult[] songs = await _context.Songs
                                                    .Where(song => EF.Functions.Like(song.SongName.ToLower(), $"%{query.ToLower()}%"))
                                                    .Include(song => song.Album)
                                                    .ThenInclude(album => album.AlbumOrSongArtFile)
                                                    .Select(song => new SearchResult
                                                    {
                                                        Id = song.SongId,
                                                        Title = song.SongName,
                                                        Image = song.Album.AlbumOrSongArtFile.FileData
                                                    }).
                                                    ToArrayAsync();

            SearchResult[] albums = await _context.Albums
                                                    .Where(album => EF.Functions.Like(album.AlbumTitle, $"%{query.ToLower()}%"))
                                                    .Include(album => album.AlbumOrSongArtFile)
                                                    .Select(album => new SearchResult
                                                    {
                                                        Id = album.AlbumId,
                                                        Title = album.AlbumTitle,
                                                        Image = album.AlbumOrSongArtFile.FileData
                                                    })
                                                    .ToArrayAsync();

            SearchResult[] artists = await _context.Musicians
                                                    .Where(musician => EF.Functions.Like(musician.MusicianName, $"%{query.ToLower()}%"))
                                                    .Include(musician => musician.ProfilePictureFile)
                                                    .Select(musician => new SearchResult
                                                    {
                                                        Id = musician.MusicianId,
                                                        Title = musician.MusicianName,
                                                        Image = musician.ProfilePictureFile.FileData
                                                    })
                                                    .ToArrayAsync();

            SearchResult[] playlists = await _context.Playlists
                                                    .Where(playlist => EF.Functions.Like(playlist.PlaylistName, $"%{query.ToLower()}%"))
                                                    .Include(playlist => playlist.PlaylistPictureFile)
                                                    .Select(playlist => new SearchResult
                                                    {
                                                        Id = playlist.PlaylistId,
                                                        Title = playlist.PlaylistName,
                                                        Image = playlist.PlaylistPictureFile.FileData
                                                    })
                                                    .ToArrayAsync();

            SearchResult[] users = await _context.Users
                                                    .Where(user => EF.Functions.Like(user.Username, $"%{query.ToLower()}%"))
                                                    .Include(user => user.ProfilePictureFile)
                                                    .Select(user => new SearchResult
                                                    {
                                                        Id = user.UserId,
                                                        Title = user.Username,
                                                        Image = (user.ProfilePictureFile!).FileData
                                                    })
                                                    .ToArrayAsync();

            SearchResult[] events = await _context.Events
                                                    .Where(myEvent => EF.Functions.Like(myEvent.Title, $"%{query.ToLower()}%"))
                                                    .Include(myEvent => myEvent.EventPictureFile)
                                                    .Select(myEvent => new SearchResult
                                                    {
                                                        Id = myEvent.EventId,
                                                        Title = myEvent.Title,
                                                        Image = myEvent.EventPictureFile.FileData
                                                    })
                                                    .ToArrayAsync();

            return Ok(new SearchResults { Songs = songs, Albums = albums, Artists = artists, Playlists = playlists, Events = events, Users = users });

        }
    }

    public class SearchResult
    {
        public ulong Id { get; set; }
        public string Title { get; set; } = null!;
        public byte[]? Image { get; set; }
    }

    public class SearchResults
    {
        public SearchResult[] Songs { get; set; } = null!;
        public SearchResult[] Albums { get; set; } = null!;
        public SearchResult[] Artists { get; set; } = null!;
        public SearchResult[] Playlists { get; set; } = null!;
        public SearchResult[] Users { get; set; } = null!;
        public SearchResult[] Events { get; set; } = null!;
    }
}