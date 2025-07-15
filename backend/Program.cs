using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using MedicalDemo.Repositories;
using MedicalDemo.Services;

// Load .env file
DotNetEnv.Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env.local"));

var builder = WebApplication.CreateBuilder(args);

//add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IMedicalRepository, MedicalDataRepository>();
builder.Services.AddScoped<SchedulingMapperService>();
builder.Services.AddScoped<SchedulerService>();
builder.Services.AddScoped<PostmarkService>();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? 
            new[] { 
                "https://psycall.net",
                "https://www.psycall.net",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            };
        
        Console.WriteLine($"CORS Allowed Origins: {string.Join(", ", allowedOrigins)}");
        
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

//connect to DB

var MySqlConnectString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

Console.WriteLine($"Loaded DB_CONNECTION_STRING: {MySqlConnectString}");

// For testing purposes, allow the app to start without DB connection
if (string.IsNullOrEmpty(MySqlConnectString))
{
    Console.WriteLine("WARNING: Database connection string is not configured. App will start but database features will not work.");
    MySqlConnectString = "server=localhost;port=3306;database=test;user=test;password=test;";
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

// Add debugging middleware to log CORS requests
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers["Origin"].ToString();
    var method = context.Request.Method;
    Console.WriteLine($"Request: {method} {context.Request.Path} from Origin: {origin}");
    await next();
});

app.UseHttpsRedirection();

app.MapControllers();

// Use the port from environment variable or default to 3000 (Coolify standard)
var port = Environment.GetEnvironmentVariable("BACKEND_PORT") ?? "5000";
app.Urls.Add($"http://0.0.0.0:{port}");


app.Run();

