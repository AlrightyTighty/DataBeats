using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using MySql.Data.MySqlClient;
using backend.DTOs.Admin;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public interface IAdminReportService
    {
        Task<AdminReportDto> GenerateReportAsync(DateTime from, DateTime to);

        Task<AdminUserActivityReportDto> GetUserReportByUsernameAsync(string username, DateTime from, DateTime to);

        Task<IEnumerable<AdminUserRowDto>> GetUsersAsync(DateTime from, DateTime to, string search);
        Task<IEnumerable<AdminMusicianRowDto>> GetMusiciansAsync(DateTime from, DateTime to, string search);
        Task<IEnumerable<AdminPlaylistRowDto>> GetPlaylistsAsync(DateTime from, DateTime to, string search);
        Task<IEnumerable<AdminAlbumRowDto>> GetAlbumsAsync(DateTime from, DateTime to, string search);
        Task<IEnumerable<AdminEventRowDto>> GetEventsAsync(DateTime from, DateTime to, string search);
        Task<IEnumerable<AdminSongRowDto>> GetSongsAsync(DateTime from, DateTime to, string search);
    }

    public class AdminReportService : IAdminReportService
    {
        private readonly string? _connectionString;

        public AdminReportService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<AdminReportDto> GenerateReportAsync(DateTime from, DateTime to)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var parameters = new { From = from, To = to };

            var report = new AdminReportDto
            {
                From = from,
                To = to,
                Users = await GetUserSummaryAsync(conn, parameters),
                Musicians = await GetMusicianSummaryAsync(conn, parameters),
                Playlists = await GetPlaylistSummaryAsync(conn, parameters),
                Albums = await GetAlbumSummaryAsync(conn, parameters),
                Events = await GetEventSummaryAsync(conn, parameters),
                Songs = await GetSongSummaryAsync(conn, parameters)
            };

            return report;
        }

        private Task<AdminUserSummaryDto> GetUserSummaryAsync(MySqlConnection conn, object parameters)
        {
            const string sql = @"
                SELECT
                  COUNT(*) AS TotalUsers,
                  SUM(CASE WHEN time_deleted IS NULL THEN 1 ELSE 0 END) AS ActiveUsers,
                  SUM(CASE WHEN time_deleted IS NOT NULL THEN 1 ELSE 0 END) AS DeletedUsers,
                  SUM(CASE WHEN time_created >= @From AND time_created < @To THEN 1 ELSE 0 END) AS NewUsersInRange,
                  SUM(CASE WHEN time_deleted IS NOT NULL AND time_deleted >= @From AND time_deleted < @To THEN 1 ELSE 0 END) AS DeletedUsersInRange
                FROM vw_UserAccountActivity;
            ";
            return conn.QuerySingleAsync<AdminUserSummaryDto>(sql, parameters);
        }

        private Task<AdminMusicianSummaryDto> GetMusicianSummaryAsync(MySqlConnection conn, object parameters)
        {
            const string sql = @"
                SELECT
                  COUNT(*) AS TotalMusicians,
                  SUM(CASE WHEN timestamp_deleted IS NULL THEN 1 ELSE 0 END) AS ActiveMusicians,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL THEN 1 ELSE 0 END) AS DeletedMusicians,
                  SUM(CASE WHEN timestamp_created >= @From AND timestamp_created < @To THEN 1 ELSE 0 END) AS NewMusiciansInRange,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To THEN 1 ELSE 0 END) AS DeletedMusiciansInRange
                FROM vw_MusicianAccountActivity;
            ";
            return conn.QuerySingleAsync<AdminMusicianSummaryDto>(sql, parameters);
        }

        private Task<AdminPlaylistSummaryDto> GetPlaylistSummaryAsync(MySqlConnection conn, object parameters)
        {
            const string sql = @"
                SELECT
                  COUNT(*) AS TotalPlaylists,
                  SUM(CASE WHEN timestamp_deleted IS NULL THEN 1 ELSE 0 END) AS ActivePlaylists,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL THEN 1 ELSE 0 END) AS DeletedPlaylists,
                  SUM(CASE WHEN timestamp_created >= @From AND timestamp_created < @To THEN 1 ELSE 0 END) AS NewPlaylistsInRange,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To THEN 1 ELSE 0 END) AS DeletedPlaylistsInRange
                FROM vw_PlaylistActivity;
            ";
            return conn.QuerySingleAsync<AdminPlaylistSummaryDto>(sql, parameters);
        }

        private Task<AdminAlbumSummaryDto> GetAlbumSummaryAsync(MySqlConnection conn, object parameters)
        {
            const string sql = @"
                SELECT
                  COUNT(*) AS TotalAlbums,
                  SUM(CASE WHEN timestamp_deleted IS NULL THEN 1 ELSE 0 END) AS ActiveAlbums,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL THEN 1 ELSE 0 END) AS DeletedAlbums,
                  SUM(CASE WHEN timestamp_created >= @From AND timestamp_created < @To THEN 1 ELSE 0 END) AS NewAlbumsInRange,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To THEN 1 ELSE 0 END) AS DeletedAlbumsInRange
                FROM vw_AlbumActivity;
            ";
            return conn.QuerySingleAsync<AdminAlbumSummaryDto>(sql, parameters);
        }

        private Task<AdminEventSummaryDto> GetEventSummaryAsync(MySqlConnection conn, object parameters)
        {
            const string sql = @"
                SELECT
                  COUNT(*) AS TotalEvents,
                  SUM(CASE WHEN timestamp_deleted IS NULL THEN 1 ELSE 0 END) AS ActiveEvents,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL THEN 1 ELSE 0 END) AS DeletedEvents,
                  SUM(CASE WHEN timestamp_created >= @From AND timestamp_created < @To THEN 1 ELSE 0 END) AS NewEventsInRange,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To THEN 1 ELSE 0 END) AS DeletedEventsInRange
                FROM vw_EventActivity;
            ";
            return conn.QuerySingleAsync<AdminEventSummaryDto>(sql, parameters);
        }

        private Task<AdminSongSummaryDto> GetSongSummaryAsync(MySqlConnection conn, object parameters)
        {
            const string sql = @"
                SELECT
                  COUNT(*) AS TotalSongs,
                  SUM(CASE WHEN timestamp_deleted IS NULL THEN 1 ELSE 0 END) AS ActiveSongs,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL THEN 1 ELSE 0 END) AS DeletedSongs,
                  SUM(CASE WHEN timestamp_created >= @From AND timestamp_created < @To THEN 1 ELSE 0 END) AS NewSongsInRange,
                  SUM(CASE WHEN timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To THEN 1 ELSE 0 END) AS DeletedSongsInRange
                FROM vw_SongActivity;
            ";
            return conn.QuerySingleAsync<AdminSongSummaryDto>(sql, parameters);
        }

        public async Task<AdminUserActivityReportDto> GetUserReportByUsernameAsync(string username, DateTime from, DateTime to)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var parameters = new { Username = username };

            const string sql = @"
                SELECT
                    username     AS Username,
                    time_created AS TimeCreated,
                    time_deleted AS TimeDeleted,
                    CASE WHEN time_deleted IS NULL THEN 0 ELSE 1 END AS IsUserDeleted
                FROM vw_UserAccountActivity
                WHERE username = @Username;
            ";

            var row = await conn.QuerySingleOrDefaultAsync<AdminUserActivityReportDto>(sql, parameters);

            if (row == null)
            {
                row = new AdminUserActivityReportDto
                {
                    Username = username
                };
            }

            row.From = from;
            row.To = to;
            return row;
        }

        public async Task<IEnumerable<AdminUserRowDto>> GetUsersAsync(DateTime from, DateTime to, string search)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var searchPattern = string.IsNullOrEmpty(search) ? null : $"%{search}%";
            var parameters = new { From = from, To = to, Search = searchPattern };

            const string sql = @"
                SELECT
                    username     AS Username,
                    time_created AS TimeCreated,
                    time_deleted AS TimeDeleted,
                    CASE WHEN time_deleted IS NULL THEN 0 ELSE 1 END AS IsDeleted
                FROM vw_UserAccountActivity
                WHERE
                    ((time_created >= @From AND time_created < @To)
                     OR (time_deleted IS NOT NULL AND time_deleted >= @From AND time_deleted < @To))
                    AND (@Search IS NULL OR username LIKE @Search);
            ";

            return await conn.QueryAsync<AdminUserRowDto>(sql, parameters);
        }

        public async Task<IEnumerable<AdminMusicianRowDto>> GetMusiciansAsync(DateTime from, DateTime to, string search)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var searchPattern = string.IsNullOrEmpty(search) ? null : $"%{search}%";
            var parameters = new { From = from, To = to, Search = searchPattern };

            const string sql = @"
                SELECT
                    musician_name        AS MusicianName,
                    username             AS Username,
                    timestamp_created    AS TimestampCreated,
                    timestamp_deleted    AS TimestampDeleted,
                    follower_count       AS FollowerCount,
                    monthly_listener_count AS MonthlyListenerCount,
                    CASE WHEN timestamp_deleted IS NULL THEN 0 ELSE 1 END AS IsDeleted
                FROM vw_MusicianAccountActivity
                WHERE
                    ((timestamp_created >= @From AND timestamp_created < @To)
                     OR (timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To))
                    AND (@Search IS NULL OR musician_name LIKE @Search);
            ";

            return await conn.QueryAsync<AdminMusicianRowDto>(sql, parameters);
        }

        public async Task<IEnumerable<AdminPlaylistRowDto>> GetPlaylistsAsync(DateTime from, DateTime to, string search)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var searchPattern = string.IsNullOrEmpty(search) ? null : $"%{search}%";
            var parameters = new { From = from, To = to, Search = searchPattern };

            const string sql = @"
                SELECT
                    playlist_name     AS PlaylistName,
                    username          AS Username,
                    timestamp_created AS TimestampCreated,
                    timestamp_deleted AS TimestampDeleted,
                    CASE WHEN timestamp_deleted IS NULL THEN 0 ELSE 1 END AS IsDeleted
                FROM vw_PlaylistActivity
                WHERE
                    ((timestamp_created >= @From AND timestamp_created < @To)
                     OR (timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To))
                    AND (@Search IS NULL OR playlist_name LIKE @Search);
            ";

            return await conn.QueryAsync<AdminPlaylistRowDto>(sql, parameters);
        }

        public async Task<IEnumerable<AdminAlbumRowDto>> GetAlbumsAsync(DateTime from, DateTime to, string search)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var searchPattern = string.IsNullOrEmpty(search) ? null : $"%{search}%";
            var parameters = new { From = from, To = to, Search = searchPattern };

            const string sql = @"
                SELECT
                    album_title       AS AlbumTitle,
                    musician_name     AS MusicianName,
                    timestamp_created AS TimestampCreated,
                    timestamp_deleted AS TimestampDeleted,
                    release_date      AS ReleaseDate,
                    num_songs         AS NumSongs,
                    CASE WHEN timestamp_deleted IS NULL THEN 0 ELSE 1 END AS IsDeleted
                FROM vw_AlbumActivity
                WHERE
                    ((timestamp_created >= @From AND timestamp_created < @To)
                     OR (timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To))
                    AND (@Search IS NULL OR album_title LIKE @Search);
            ";

            return await conn.QueryAsync<AdminAlbumRowDto>(sql, parameters);
        }

        public async Task<IEnumerable<AdminEventRowDto>> GetEventsAsync(DateTime from, DateTime to, string search)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var searchPattern = string.IsNullOrEmpty(search) ? null : $"%{search}%";
            var parameters = new { From = from, To = to, Search = searchPattern };

            const string sql = @"
                SELECT
                    title             AS Title,
                    musician_name     AS MusicianName,
                    timestamp_created AS TimestampCreated,
                    timestamp_deleted AS TimestampDeleted,
                    event_time        AS EventTime,
                    CASE WHEN timestamp_deleted IS NULL THEN 0 ELSE 1 END AS IsDeleted
                FROM vw_EventActivity
                WHERE
                    ((timestamp_created >= @From AND timestamp_created < @To)
                     OR (timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To))
                    AND (@Search IS NULL OR title LIKE @Search);
            ";

            return await conn.QueryAsync<AdminEventRowDto>(sql, parameters);
        }

        public async Task<IEnumerable<AdminSongRowDto>> GetSongsAsync(DateTime from, DateTime to, string search)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var searchPattern = string.IsNullOrEmpty(search) ? null : $"%{search}%";
            var parameters = new { From = from, To = to, Search = searchPattern };

            const string sql = @"
                SELECT
                    song_name         AS SongName,
                    album_title       AS AlbumTitle,
                    musician_name     AS MusicianName,
                    timestamp_created AS TimestampCreated,
                    timestamp_deleted AS TimestampDeleted,
                    streams           AS Streams,
                    CASE WHEN timestamp_deleted IS NULL THEN 0 ELSE 1 END AS IsDeleted
                FROM vw_SongActivity
                WHERE
                    ((timestamp_created >= @From AND timestamp_created < @To)
                     OR (timestamp_deleted IS NOT NULL AND timestamp_deleted >= @From AND timestamp_deleted < @To))
                    AND (@Search IS NULL OR song_name LIKE @Search);
            ";

            return await conn.QueryAsync<AdminSongRowDto>(sql, parameters);
        }
    }
}