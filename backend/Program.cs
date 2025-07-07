using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using MedicalDemo.Services;
using MedicalDemo.Repositories;


// Load .env file
Env.Load();
DotNetEnv.Env.Load(".env.local");
Console.WriteLine("ENV CHECK:");
Console.WriteLine("FROM_EMAIL = " + Environment.GetEnvironmentVariable("FROM_EMAIL"));
Console.WriteLine("POSTMARK_API_KEY = " + Environment.GetEnvironmentVariable("POSTMARK_API_KEY"));

DotNetEnv.Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

var builder = WebApplication.CreateBuilder(args);

//add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<PostmarkService>();

builder.Services.AddScoped<IMedicalRepository, MedicalDataRepository>();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003",
                          "https://psycall.net", "https://www.psycall.net", "https://backend.psycall.net")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

//connect to DB

var MySqlConnectString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

// Check if the connection string accidentally includes the variable name
if (!string.IsNullOrEmpty(MySqlConnectString) && MySqlConnectString.StartsWith("DB_CONNECTION_STRING="))
{
    MySqlConnectString = MySqlConnectString.Substring("DB_CONNECTION_STRING=".Length);
}


if (string.IsNullOrEmpty(MySqlConnectString))
{
    throw new Exception("Database connection string is not configured. Please set DB_CONNECTION_STRING environment variable.");
}

try
{
    builder.Services.AddDbContext<MedicalContext>(options =>
    {
        options.UseMySql(MySqlConnectString, ServerVersion.AutoDetect(MySqlConnectString));
    });

    builder.Services.AddScoped<PostmarkService>();

}
catch (Exception ex)
{
    throw new Exception("Error configuring database connection", ex);
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Don't use HTTPS redirection in production - Coolify handles SSL termination
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Add CORS middleware
app.UseCors("AllowFrontend");

app.MapControllers();

// Configure port binding for Coolify deployment
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");

if (string.IsNullOrEmpty(urls))
{
    // Fallback: bind to the port Coolify expects
    app.Urls.Add($"http://0.0.0.0:{port}");
}

//test
//Call your functions here to run the functions.
//Run it on console line to see the output.
// Only run test data generation in development environment
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var repo = scope.ServiceProvider.GetRequiredService<IMedicalRepository>();
        var context = scope.ServiceProvider.GetRequiredService<MedicalContext>();

        var admins = await repo.GetAllAdminsAsync();
        var residents = await repo.GetAllResidentsAsync();
        var rotations = await repo.GetAllRotationsAsync();
        var pgy1 = await repo.LoadPGYOne();
        var pgy2 = await repo.LoadPGYTwo();
        var pgy3 = await repo.LoadPGYThree();
        var residentRolesByMonth = await repo.GetResidentRolesByMonthAsync();
        var trainingDates = await repo.GenerateTrainingScheduleAsync();
        
        // Generate the new scheduleID
        var newSchedule = new Schedules
        {
            ScheduleId = Guid.NewGuid(),
            Status = "Under review"
        };
        context.schedules.Add(newSchedule);
        await context.SaveChangesAsync(); // Save so we can use the schedule_id as a foreign key

        // Insert the schedule dates into the database
        foreach (var date in trainingDates)
        {
            if (!string.IsNullOrWhiteSpace(date.ResidentId))
            {
                // If ResidentId contains multiple IDs separated by commas, split them
                var residentIds = date.ResidentId.Split(',', StringSplitOptions.RemoveEmptyEntries);

                foreach (var residentId in residentIds)
                {
                    var trimmedResidentId = residentId.Trim();
                    var entry = new Dates
                    {
                        DateId = Guid.NewGuid(),
                        ScheduleId = newSchedule.ScheduleId,
                        ResidentId = trimmedResidentId,
                        Date = date.Date,
                        CallType = date.CallType
                    };

                    context.dates.Add(entry);
                }
            }
        }
        await context.SaveChangesAsync();
    }
}
app.Run();

