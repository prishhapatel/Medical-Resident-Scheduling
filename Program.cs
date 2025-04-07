using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;



var builder = WebApplication.CreateBuilder(args);

//add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



//connect to DB
var MySqlConnectString = builder.Configuration.GetConnectionString("MySqlConn");
builder.Services.AddDbContext<MedicalContext>(options =>
{
    Console.WriteLine($"MySqlConnectString: {MySqlConnectString}");

    options.UseMySql(MySqlConnectString, ServerVersion.AutoDetect(MySqlConnectString));
});





var app = builder.Build();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();



app.Run();
