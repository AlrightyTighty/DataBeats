using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using backend.DTOs.Musician;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Amazon.Runtime.Internal.Transform;

namespace backend.Services
{
    public class MusicianReportService
    {
        private readonly ApplicationDBContext _context;

        public MusicianReportService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MusicianReport>> GetMusicianReportsAsync(MusicianReportRequest request)
        {
            using var connection = _context.Database.GetDbConnection();

            // stringbuilder to build sql dynamically
            var sql = new StringBuilder("SELECT musician_ids AS MusicianIds, release_date AS ReleaseDate, album_id AS AlbumId, album_title AS AlbumTitle, song_name AS SongName, genres AS Genres");

            // Dapper parameters - request.X is incoming C# data; @X is SQL parameter name -> Dapper connects them through parameters.Add("X", request.X) by assigning the value from request.X to a new SQL parameter named @X
            var parameters = new DynamicParameters();

            // optional columns to show depending on user request
            if (request.IncludeAvgRating) sql.Append(", avg_rating AS AvgRating");
            if (request.IncludeLikes) sql.Append(", likes AS Likes");
            if (request.IncludeStreams) sql.Append(", streams AS Streams");

            // query from musician_report view by musicianId
            sql.Append(" FROM musician_report WHERE FIND_IN_SET(@MusicianId, musician_ids) > 0");
            parameters.Add("MusicianId", request.MusicianId);

            // optionally filter by release date, album, and/or genre
            if (request.ReleaseDateFrom.HasValue)
            {
                sql.Append(" AND release_date >= @ReleaseDateFrom");
                parameters.Add("ReleaseDateFrom", request.ReleaseDateFrom.Value);
            }
            if (request.ReleaseDateTo.HasValue)
            {
                sql.Append(" AND release_date <= @ReleaseDateTo");
                parameters.Add("ReleaseDateTo", request.ReleaseDateTo.Value);
            }
            if (request.AlbumIds != null && request.AlbumIds.Count > 0)
            {
                sql.Append(" AND album_id IN @AlbumIds");
                parameters.Add("AlbumIds", request.AlbumIds);
            }
            if (request.Genres != null && request.Genres.Count > 0)
            {
                sql.Append(" AND (");
                for (int i = 0; i < request.Genres.Count; ++i)
                {
                    if (i > 0) sql.Append(" OR ");
                    sql.Append($"FIND_IN_SET(@Genre{i}, genres) > 0");
                    parameters.Add($"Genre{i}", request.Genres[i]);
                }
                sql.Append(')');    // char '' instead of string ""
            }

            // execute sql async and map results to MusicianReport model
            return await connection.QueryAsync<MusicianReport>(sql.ToString(), parameters);
        }
    }
}