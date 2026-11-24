using Backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : IdentityUserContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Field> Fields { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Απαραίτητο: εδώ το Identity ορίζει τους δικούς του πίνακες.
        base.OnModelCreating(builder);

        builder.Entity<AppUser>().Property(u => u.FullName).HasMaxLength(100);

        // Κάθε χωράφι ανήκει υποχρεωτικά σε έναν χρήστη.
        builder.Entity<Field>()
            .HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}