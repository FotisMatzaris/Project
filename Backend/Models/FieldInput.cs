namespace Backend.Models
{
    /// <summary>
    /// Δεδομένα που στέλνει ο client για δημιουργία/ενημέρωση χωραφιού.
    /// Δεν περιλαμβάνει Id: το Id το ορίζει πάντα η βάση.
    /// </summary>
    public record FieldInput(string? Name, string? CropType, double SizeInStremmata);
}
