using System.Security.Claims;
using System.Text.RegularExpressions;
using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.Endpoints;

public static class AuthEndpoints
{
    private const int MaxNameLength = 100;
    private const int MaxEmailLength = 256;
    private const int MinPasswordLength = 8;
    private const int MaxPasswordLength = 128;

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        // Υπάρχει λογαριασμός με αυτό το email;
        group.MapPost("/check", async (CheckEmailInput input, UserManager<AppUser> users) =>
        {
            var email = input.Email?.Trim() ?? "";
            if (!IsValidEmail(email)) return Error("email", "Γράψε ένα έγκυρο email.");

            var user = await users.FindByEmailAsync(email);
            return Results.Ok(new { exists = user is not null });
        }).RequireRateLimiting("auth");

        // Εγγραφή
        group.MapPost("/register", async (
            RegisterInput input, UserManager<AppUser> users, SignInManager<AppUser> signIn) =>
        {
            var errors = Validate(input);
            if (errors.Count > 0) return Results.ValidationProblem(errors);

            var email = input.Email!.Trim();
            var user = new AppUser
            {
                UserName = email,
                Email = email,
                FullName = input.FullName!.Trim()
            };

            // Το Identity αποθηκεύει hash, ποτέ τον ίδιο τον κωδικό.
            var result = await users.CreateAsync(user, input.Password!);
            if (!result.Succeeded)
            {
                var duplicate = result.Errors.Any(e => e.Code.StartsWith("Duplicate"));
                return duplicate
                    ? Error("email", "Υπάρχει ήδη λογαριασμός με αυτό το email.")
                    : Error("account", "Ο λογαριασμός δεν δημιουργήθηκε. Έλεγξε τα στοιχεία σου.");
            }

            await signIn.SignInAsync(user, isPersistent: !input.SharedComputer);
            return Results.Ok(ToResponse(user));
        }).RequireRateLimiting("auth");

        // Σύνδεση
        group.MapPost("/login", async (
            LoginInput input, UserManager<AppUser> users, SignInManager<AppUser> signIn) =>
        {
            var email = input.Email?.Trim() ?? "";
            var password = input.Password ?? "";
            if (password.Length > MaxPasswordLength) return WrongCredentials();

            var user = await users.FindByEmailAsync(email);
            if (user is null) return WrongCredentials();

            var result = await signIn.PasswordSignInAsync(
                user, password, isPersistent: !input.SharedComputer, lockoutOnFailure: true);

            if (result.IsLockedOut)
                return Error("account", "Πολλές λάθος προσπάθειες. Δοκίμασε ξανά σε 5 λεπτά.");

            return result.Succeeded ? Results.Ok(ToResponse(user)) : WrongCredentials();
        }).RequireRateLimiting("auth");

        // Αποσύνδεση
        group.MapPost("/logout", async (SignInManager<AppUser> signIn) =>
        {
            await signIn.SignOutAsync();
            return Results.NoContent();
        });

        // Ποιος είναι συνδεδεμένος
        group.MapGet("/me", async (ClaimsPrincipal principal, UserManager<AppUser> users) =>
        {
            var user = await users.GetUserAsync(principal);
            return user is null ? Results.Unauthorized() : Results.Ok(ToResponse(user));
        }).RequireAuthorization();

        return app;
    }

    // Μόνο όσα χρειάζεται το frontend, ποτέ ολόκληρος ο AppUser (περιέχει το hash).
    private static object ToResponse(AppUser user) => new { fullName = user.FullName, email = user.Email };

    private static IResult Error(string key, string message) =>
        Results.ValidationProblem(new Dictionary<string, string[]> { [key] = new[] { message } });

    private static IResult WrongCredentials() => Error("password", "Λάθος email ή κωδικός.");

    private static bool IsValidEmail(string email) =>
        email.Length <= MaxEmailLength && Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");

    private static Dictionary<string, string[]> Validate(RegisterInput input)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(input.FullName))
            errors["fullName"] = new[] { "Το όνομα είναι υποχρεωτικό." };
        else if (input.FullName.Trim().Length > MaxNameLength)
            errors["fullName"] = new[] { $"Το όνομα δεν μπορεί να ξεπερνά τους {MaxNameLength} χαρακτήρες." };

        if (!IsValidEmail(input.Email?.Trim() ?? ""))
            errors["email"] = new[] { "Γράψε ένα έγκυρο email." };

        var length = input.Password?.Length ?? 0;
        if (length < MinPasswordLength)
            errors["password"] = new[] { $"Ο κωδικός θέλει τουλάχιστον {MinPasswordLength} χαρακτήρες." };
        else if (length > MaxPasswordLength)
            errors["password"] = new[] { $"Ο κωδικός δεν μπορεί να ξεπερνά τους {MaxPasswordLength} χαρακτήρες." };

        return errors;
    }
}