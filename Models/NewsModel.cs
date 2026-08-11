using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace OnlineGspApp.Models
{
    public class NewsModel
    {
        public NewsModel()
        {
            Images = new List<string>();
            CrcDate = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            Status = "pending";
        }

        [Required]
        public string Id { get; set; }

        [Required, MaxLength(300)]
        public string Title { get; set; }

        public string HtmlBody { get; set; }

        public List<string> Images { get; set; }

        public DateTime CrcDate { get; set; }

        public string CrcBy { get; set; }

        [MaxLength(50)]
        public string Status { get; set; }

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; }
    }
}
