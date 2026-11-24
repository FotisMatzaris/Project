namespace Backend.Models;

/// <summary>Δεδομένα που στέλνει ο client για τους λογαριασμούς.</summary>
public record CheckEmailInput(string? Email);

public record RegisterInput(string? FullName, string? Email, string? Password, bool SharedComputer);

public record LoginInput(string? Email, string? Password, bool SharedComputer);