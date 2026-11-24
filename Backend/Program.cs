using System.Threading.RateLimiting;
using Backend.Data;
using Backend.Endpoints;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Λείπει το ConnectionStrings:DefaultConnection. Δες το README (ενότητα «Ρύθμιση βάσης»).");
}

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// Λογαριασμοί χρηστών (ASP.NET Core Identity).
builder.Services
    .AddIdentityCore<AppUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        // Το UserName είναι το email, οπότε επιτρέπουμε κάθε χαρακτήρα που έχει ένα email.
        options.User.AllowedUserNameCharacters = "";
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        // Μετά από 5 λάθος κωδικούς, ο λογαριασμός κλειδώνει για 5 λεπτά.
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    })
    .AddSignInManager()
    .AddEntityFrameworkStores<AppDbContext>();

// Η σύνδεση κρατιέται σε cookie που δεν το διαβάζει η JavaScript (HttpOnly).
builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies();
builder.Services.AddAuthorization();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "agrilog_auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(14);
    options.SlidingExpiration = true;

    // Είμαστε API: απαντάμε 401/403 αντί να στέλνουμε σε σελίδα σύνδεσης.
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

// Όριο: 20 προσπάθειες το λεπτό ανά διεύθυνση IP στα endpoints των λογαριασμών.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1)
        }));
});

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
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapFieldEndpoints();

app.Run();