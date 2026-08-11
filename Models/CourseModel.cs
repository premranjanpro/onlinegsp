using System;
using System.ComponentModel.DataAnnotations;

namespace OnlineGspApp.Models
{
    public enum CourseStatus
    {
        Inactive = 0,
        Active = 1,
        Archived = 2
    }

    public class CourseModel
    {
        public CourseModel()
        {
            // set default values here (VS 2013 compatible)
            Rating = 0;
            Price = 0;
            OfferPrice = 0;
            Status = CourseStatus.Active;
            CreatedAt = DateTime.UtcNow;
        }

        [Required]
        public string Id { get; set; }

        [Required]
        public string CourseCategory { get; set; }

        // relative URL / path to saved image
        public string Image { get; set; }

        [Required]
        public string Duration { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        // full HTML description
        public string HtmlDesc { get; set; }

        // 0-5 rating scale (fraction allowed)
        [Range(0, 5)]
        public double Rating { get; set; }

        // pricing fields
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, double.MaxValue)]
        public decimal OfferPrice { get; set; }

        // short text
        [MaxLength(500)]
        public string ShortDesc { get; set; }

        // Active / Inactive / Archived
        public CourseStatus Status { get; set; }

        // audit
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
    }
}
