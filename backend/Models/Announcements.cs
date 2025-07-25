using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    [Table("announcements")]
    public class Announcements
    {
        [Key]
        [Column("announcement_id")]
        public Guid AnnouncementId { get; set; }

        [Column("author_id")]
        public string? AuthorId { get; set; }

        [Required]
        [Column("message")]
        [MaxLength(150)]
        public string? Message { get; set; }
        
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}