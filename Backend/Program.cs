using Backend.Data;
using Backend.Endpoints;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Λείπει το ConnectionStrings:DefaultConnection. Δες το README (ενότητα «Ρύθμιση βάσης»).");
}

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Τα origins επιτρέπονται από τη ρύθμιση "Cors:AllowedOrigins" (προεπιλογή: Vite dev server).
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Δημιουργεί/ενημερώνει αυτόματα τη βάση στην ανάπτυξη (δεν χρειάζεται `dotnet ef database update`).
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}
else
{
    // Στην ανάπτυξη το αφήνουμε εκτός ώστε οι κλήσεις του frontend να μην ανακατευθύνονται σε https.
    app.UseHttpsRedirection();
}

app.UseCors("AllowReactApp");

app.MapFieldEndpoints();

app.Run();
