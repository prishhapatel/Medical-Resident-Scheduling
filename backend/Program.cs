using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

// Load .env file
DotNetEnv.Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

var builder = WebApplication.CreateBuilder(args);

//add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IMedicalRepository, MedicalDataRepository>();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://psycall.net", 
                          "https://www.psycall.net", "http://localhost:3001", "https://backend.psycall.net")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

//connect to DB

var MySqlConnectString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

Console.WriteLine($"Raw DB_CONNECTION_STRING: '{MySqlConnectString}'");
Console.WriteLine($"DB_CONNECTION_STRING length: {MySqlConnectString?.Length ?? 0}");

// Check if the connection string accidentally includes the variable name
if (!string.IsNullOrEmpty(MySqlConnectString) && MySqlConnectString.StartsWith("DB_CONNECTION_STRING="))
{
    Console.WriteLine("Warning: Connection string contains variable name prefix, removing it...");
    MySqlConnectString = MySqlConnectString.Substring("DB_CONNECTION_STRING=".Length);
    Console.WriteLine($"Cleaned DB_CONNECTION_STRING: '{MySqlConnectString}'");
}


if (string.IsNullOrEmpty(MySqlConnectString))
{
    throw new Exception("Database connection string is not configured. Please set DB_CONNECTION_STRING environment variable.");
}

try
{
    builder.Services.AddDbContext<MedicalContext>(options =>
    {
        Console.WriteLine("Attempting to connect to database...");
        options.UseMySql(MySqlConnectString, ServerVersion.AutoDetect(MySqlConnectString));
    });
}
catch (Exception ex)
{
    Console.WriteLine("Error configuring database connection:");
    Console.WriteLine(ex.Message);
    throw;
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

if (!string.IsNullOrEmpty(urls))
{
    Console.WriteLine($"Using ASPNETCORE_URLS: {urls}");
    // Let ASPNETCORE_URLS handle the binding
}
else
{
    // Fallback: bind to the port Coolify expects
    Console.WriteLine($"Binding to port: {port}");
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

        Console.WriteLine("Loaded Training Schedule: ");
        foreach (var date in trainingDates)
        {
            Console.WriteLine($"Resident ID: {date.ResidentId}, Date: {date.Date}, Call Type: {date.CallType}");
        }
        
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

