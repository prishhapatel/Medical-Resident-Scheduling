using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using MedicalDemo.Services;


// Load .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

//add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

//connect to DB
var MySqlConnectString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

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

    builder.Services.AddScoped<PostmarkService>();

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

app.UseHttpsRedirection();

// Add CORS middleware
app.UseCors("AllowFrontend");

app.MapControllers();

// Use the port from environment variable or default to 5109
var port = Environment.GetEnvironmentVariable("BACKEND_PORT") ?? "5109";
app.Urls.Add($"http://localhost:{port}");

app.Run();
