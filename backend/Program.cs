using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using MedicalDemo.Services;

// Load .env file
DotNetEnv.Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

var builder = WebApplication.CreateBuilder(args);

//add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<SchedulingMapperService>();
builder.Services.AddScoped<SchedulerService>();
builder.Services.AddScoped<PostmarkService>();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => 
                origin.StartsWith("https://psycall.net") || 
                origin.StartsWith("https://www.psycall.net") ||
                origin.StartsWith("http://localhost"))
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

//connect to DB

var MySqlConnectString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

Console.WriteLine($"Loaded DB_CONNECTION_STRING: {MySqlConnectString}");


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

// Add CORS middleware - MUST be first, before any other middleware
app.UseCors("AllowFrontend");

// Handle preflight requests
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.Headers.Add("Access-Control-Allow-Origin", context.Request.Headers["Origin"]);
        context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        context.Response.StatusCode = 200;
        return;
    }
    await next();
});

app.UseHttpsRedirection();

app.MapControllers();

// Use the port from environment variable or default to 5109
var port = Environment.GetEnvironmentVariable("BACKEND_PORT") ?? "5109";
app.Urls.Add($"http://0.0.0.0:{port}");


app.Run();