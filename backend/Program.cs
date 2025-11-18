using backend.Middleware;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<MusicianReportService>();

builder.Services.AddDbContext<ApplicationDBContext>((options) =>
{
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), ServerVersion.Parse("8.0.28-mysql"));
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {

        builder.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });

    options.AddPolicy(name: "AllowSpecificOrigins", builder =>
        {
            builder.WithOrigins("http://127.0.0.1:5173", "http://localhost:5173", "https://databeats-frontend-63991322723.us-south1.run.app")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

builder.Services.AddHostedService<EmailService>();

var app = builder.Build();

// Configure the HTTP request pipeline.


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowSpecificOrigins");

//app.UseHttpsRedirection();

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/me"), appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/musician") && context.Request.Method == "POST", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/song/file") && context.Request.Method == "POST", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/art") && context.Request.Method == "POST", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/album") && context.Request.Method == "POST", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/stream") && context.Request.Method == "PATCH", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/rating") && context.Request.Method == "POST", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/playlist/me") && context.Request.Method == "GET", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/playlist") && context.Request.Method == "POST", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/admin"), appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/report") && context.Request.Method == "POST", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => (context.Request.Method == "POST" && !context.Request.Path.StartsWithSegments("/api/authentication") && !context.Request.Path.StartsWithSegments("/api/user")) || context.Request.Method == "PATCH" || context.Request.Method == "PUT" || context.Request.Method == "DELETE", appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/playlistpage"), appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
});

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/event/file") && (context.Request.Method == "POST" || context.Request.Method == "PUT" || context.Request.Method == "DELETE"), appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/event") && (context.Request.Method == "POST" || context.Request.Method == "PUT" || context.Request.Method == "DELETE"), appBuilder =>
{
    appBuilder.UseMiddleware<AuthenticationHandler>();
}
);

app.MapControllers();

app.Run();