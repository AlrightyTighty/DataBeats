using System;
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
        Task<AdminUserActivityReportDto> GetUserReportAsync(ulong userId, DateTime from, DateTime to);
    }

    public class AdminReportService : IAdminReportService
    {
        private readonly string _connectionString;

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
                From      = from,
                To        = to,
                Users     = await GetUserSummaryAsync(conn, parameters),
                Musicians = await GetMusicianSummaryAsync(conn, parameters),
                Playlists = await GetPlaylistSummaryAsync(conn, parameters),
                Albums    = await GetAlbumSummaryAsync(conn, parameters),
                Events    = await GetEventSummaryAsync(conn, parameters),
                Songs     = await GetSongSummaryAsync(conn, parameters)
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

                  SUM(CASE 
                        WHEN time_created >= @From AND time_created < @To 
                        THEN 1 ELSE 0 
                      END) AS NewUsersInRange,

                  SUM(CASE 
                        WHEN time_deleted IS NOT NULL 
                         AND time_deleted >= @From AND time_deleted < @To 
                        THEN 1 ELSE 0 
                      END) AS DeletedUsersInRange
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

                  SUM(CASE 
                        WHEN timestamp_created >= @From AND timestamp_created < @To 
                        THEN 1 ELSE 0 
                      END) AS NewMusiciansInRange,

                  SUM(CASE 
                        WHEN timestamp_deleted IS NOT NULL 
                         AND timestamp_deleted >= @From AND timestamp_deleted < @To 
                        THEN 1 ELSE 0 
                      END) AS DeletedMusiciansInRange
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

                  SUM(CASE 
                        WHEN timestamp_created >= @From AND timestamp_created < @To 
                        THEN 1 ELSE 0 
                      END) AS NewPlaylistsInRange,

                  SUM(CASE 
                        WHEN timestamp_deleted IS NOT NULL 
                         AND timestamp_deleted >= @From AND timestamp_deleted < @To 
                        THEN 1 ELSE 0 
                      END) AS DeletedPlaylistsInRange
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

                  SUM(CASE 
                        WHEN timestamp_created >= @From AND timestamp_created < @To 
                        THEN 1 ELSE 0 
                      END) AS NewAlbumsInRange,

                  SUM(CASE 
                        WHEN timestamp_deleted IS NOT NULL 
                         AND timestamp_deleted >= @From AND timestamp_deleted < @To 
                        THEN 1 ELSE 0 
                      END) AS DeletedAlbumsInRange
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

                  SUM(CASE 
                        WHEN timestamp_created >= @From AND timestamp_created < @To 
                        THEN 1 ELSE 0 
                      END) AS NewEventsInRange,

                  SUM(CASE 
                        WHEN timestamp_deleted IS NOT NULL 
                         AND timestamp_deleted >= @From AND timestamp_deleted < @To 
                        THEN 1 ELSE 0 
                      END) AS DeletedEventsInRange
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

                  SUM(CASE 
                        WHEN timestamp_created >= @From AND timestamp_created < @To 
                        THEN 1 ELSE 0 
                      END) AS NewSongsInRange,

                  SUM(CASE 
                        WHEN timestamp_deleted IS NOT NULL 
                         AND timestamp_deleted >= @From AND timestamp_deleted < @To 
                        THEN 1 ELSE 0 
                      END) AS DeletedSongsInRange
                FROM vw_SongActivity;
            ";

            return conn.QuerySingleAsync<AdminSongSummaryDto>(sql, parameters);
        }

        public async Task<AdminUserActivityReportDto> GetUserReportAsync(
            ulong userId, DateTime from, DateTime to)
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            var parameters = new { UserId = userId, From = from, To = to };

            const string sql = @"
                SELECT
                    user_Id        AS UserId,
                    username       AS Username,
                    time_created   AS TimeCreated,
                    time_deleted   AS TimeDeleted
                FROM vw_UserAccountActivity
                WHERE user_Id = @UserId;
            ";

            var row = await conn.QuerySingleOrDefaultAsync<AdminUserActivityReportDto>(sql, parameters);
            return row ?? new AdminUserActivityReportDto();
        }
    }
}