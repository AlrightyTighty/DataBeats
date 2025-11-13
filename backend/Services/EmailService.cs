using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DatabaseCheckService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DatabaseCheckService> _logger;

        public DatabaseCheckService(IServiceProvider serviceProvider, ILogger<DatabaseCheckService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DatabaseCheckService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Create a scoped service provider so we can use scoped services like DbContext
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();

                        // Example: check if table has entries
                        List<Email> emails = await dbContext.Emails.Where(e => e.Sent == 0).ToListAsync();

                        foreach (Email email in emails)
                        {
                            
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error checking database.");
                }

                // Wait 1 minute before next check
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}