using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints;

public static class FieldEndpoints
{
    private const int MaxTextLength = 100;

    public static IEndpointRouteBuilder MapFieldEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/fields").WithTags("Fields").RequireAuthorization();

        // Λίστα των χωραφιών του συνδεδεμένου χρήστη
        group.MapGet("/", async (ClaimsPrincipal user, AppDbContext db) =>
        {
            var userId = GetUserId(user);
            return Results.Ok(await db.Fields.AsNoTracking()
                .Where(f => f.UserId == userId)
                .OrderBy(f => f.Id)
                .ToListAsync());
        });

        // Ένα χωράφι
        group.MapGet("/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var userId = GetUserId(user);
            var field = await db.Fields.AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
            return field is null ? Results.NotFound() : Results.Ok(field);
        });

        // Δημιουργία
        group.MapPost("/", async (FieldInput input, ClaimsPrincipal user, AppDbContext db) =>
        {
            var errors = Validate(input);
            if (errors.Count > 0) return Results.ValidationProblem(errors);

            var field = new Field
            {
                Name = input.Name!.Trim(),
                CropType = input.CropType!.Trim(),
                SizeInStremmata = input.SizeInStremmata,
                UserId = GetUserId(user)
            };

            db.Fields.Add(field);
            await db.SaveChangesAsync();
            return Results.Created($"/api/fields/{field.Id}", field);
        });

        // Ενημέρωση
        group.MapPut("/{id:int}", async (int id, FieldInput input, ClaimsPrincipal user, AppDbContext db) =>
        {
            var errors = Validate(input);
            if (errors.Count > 0) return Results.ValidationProblem(errors);

            var userId = GetUserId(user);
            var field = await db.Fields.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
            if (field is null) return Results.NotFound();

            field.Name = input.Name!.Trim();
            field.CropType = input.CropType!.Trim();
            field.SizeInStremmata = input.SizeInStremmata;

            await db.SaveChangesAsync();
            return Results.Ok(field);
        });

        // Διαγραφή
        group.MapDelete("/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var userId = GetUserId(user);
            var field = await db.Fields.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
            if (field is null) return Results.NotFound();

            db.Fields.Remove(field);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        return app;
    }

    // Το id έρχεται από το cookie σύνδεσης, ποτέ από τα δεδομένα που στέλνει ο client.
    private static string GetUserId(ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("Λείπει το id του χρήστη.");

    private static Dictionary<string, string[]> Validate(FieldInput input)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(input.Name))
            errors["name"] = new[] { "Το όνομα είναι υποχρεωτικό." };
        else if (input.Name.Trim().Length > MaxTextLength)
            errors["name"] = new[] { $"Το όνομα δεν μπορεί να ξεπερνά τους {MaxTextLength} χαρακτήρες." };

        if (string.IsNullOrWhiteSpace(input.CropType))
            errors["cropType"] = new[] { "Ο τύπος καλλιέργειας είναι υποχρεωτικός." };
        else if (input.CropType.Trim().Length > MaxTextLength)
            errors["cropType"] = new[] { $"Ο τύπος καλλιέργειας δεν μπορεί να ξεπερνά τους {MaxTextLength} χαρακτήρες." };

        if (double.IsNaN(input.SizeInStremmata) || double.IsInfinity(input.SizeInStremmata) || input.SizeInStremmata <= 0)
            errors["sizeInStremmata"] = new[] { "Τα στρέμματα πρέπει να είναι αριθμός μεγαλύτερος από 0." };

        return errors;
    }
}