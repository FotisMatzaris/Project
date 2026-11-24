using Microsoft.AspNetCore.Identity;

namespace Backend.Models;

/// <summary>
/// Ο χρήστης του Agrilog. Το email και το hash του κωδικού έρχονται από το IdentityUser.
/// </summary>
public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}