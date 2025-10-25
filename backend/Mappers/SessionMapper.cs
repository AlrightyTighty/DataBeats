using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.Authentication;
using backend.Models;

namespace backend.Mappers
{
    public static class SessionMapper
    {
        public static SessionDto ToSessionDTO(this Session session)
        {
            return new SessionDto
            {
                SessionId = session.SessionId,
                IssuedAt = session.IssuedAt,
                ExperationTime = session.ExperationTime,
                Revoked = session.Revoked
            };
        }
    }
}