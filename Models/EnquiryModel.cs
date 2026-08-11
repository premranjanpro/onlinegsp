using System;
using System.ComponentModel.DataAnnotations;

namespace OnlineGspApp.Models
{
    public class EnquiryModel
    {
        public EnquiryModel()
        {
            // VS 2013 compatible initializer
            CreatedAt = DateTime.UtcNow;
        }

        [Required]
        public string Id { get; set; }

        [Required, MaxLength(200)]
        public string Name { get; set; }

        [MaxLength(200), EmailAddress]
        public string Email { get; set; }

        [MaxLength(50)]
        public string Mobile { get; set; }

        [MaxLength(100)]
        public string State { get; set; }

        [MaxLength(100)]
        public string City { get; set; }

        [MaxLength(100)]
        public string District { get; set; }

        public string Remarks { get; set; }

        // CourseId or course title
        public string Course { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
