using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class Field
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // π.χ. Τοποθεσία χωραφιού
        public string CropType { get; set; } = string.Empty; // π.χ. Ακτινίδια, Ροδάκινα, Κεράσια
        public double SizeInStremmata { get; set; } // Μέγεθος σε στρέμματα

        // Σε ποιον χρήστη ανήκει. Δεν στέλνεται ποτέ στον client.
        [JsonIgnore]
        public string UserId { get; set; } = string.Empty;
    }
}