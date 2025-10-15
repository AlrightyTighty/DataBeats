using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Middleware
{
    public class AuthenticationHandler
    {
        private readonly RequestDelegate next;

        public AuthenticationHandler(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDBContext dbContext)
        {
            Console.WriteLine("Middlewaring!");
            if (!context.Request.Cookies.ContainsKey("session-id"))
            {
                Console.WriteLine("Authentication cookie not found!");
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            Console.WriteLine(context.Request.Cookies["session-id"]);
            Session? session = await dbContext.Sessions.FindAsync(context.Request.Cookies["session-id"]);

            if (session == null)
            {
                Console.WriteLine("Session not found!");
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            context.Request.Headers.Append("X-UserId", session.UserId.ToString());
            await next(context);

        }
    }
}