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
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
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

app.UseHttpsRedirection();

// Add CORS middleware
app.UseCors("AllowFrontend");

app.MapControllers();

// Use the port from environment variable or default to 5109
var port = Environment.GetEnvironmentVariable("BACKEND_PORT") ?? "5109";
app.Urls.Add($"http://localhost:{port}");

//test
//Call your functions here to run the functions.
//Run it on console line to see the output.
using (var scope = app.Services.CreateScope())
{
    var repo = scope.ServiceProvider.GetRequiredService<IMedicalRepository>();
    var admins = await repo.GetAllAdminsAsync();
    var residents = await repo.GetAllResidentsAsync();
    var rotations = await repo.GetAllRotationsAsync();
    var pgy1 = await repo.LoadPGYOne();

    var pgy2 = await repo.LoadPGYTwo();
    var pgy3 = await repo.LoadPGYThree();
    var residentRolesByMonth = await repo.GetResidentRolesByMonthAsync();

    var trainingDates = await repo.GenerateTrainingScheduleAsync();

    Console.WriteLine("Loaded Admins:");
    foreach (var admin in admins)
    {
        Console.WriteLine($"ID: {admin.admin_id}, Name: {admin.first_name}");
    }


    Console.WriteLine("Loaded residents:");
    foreach (var resident in residents)
    {
        Console.WriteLine($"ID: {resident.resident_id}, Name: {resident.first_name}");
    }

  
    Console.WriteLine("Loaded Training Schedule: ");
    foreach( var date in trainingDates)
    {
        Console.WriteLine($"Resident ID: {date.ResidentId}, Date: {date.Date}, Call Type: {date.CallType}");
    }




}

app.Run();
