using System;
using System.ComponentModel.DataAnnotations;

namespace OnlineGspApp.Models
{
    public class ResultModel
    {
        public ResultModel()
        {
            // VS 2013 compatible default initialization
            CreatedAt = DateTime.UtcNow;
        }

        [Required]
        public string Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string ENROLNO { get; set; } // unique

        [MaxLength(100)]
        public string ROLLNO { get; set; }

        [MaxLength(200)]
        public string BRANCHNAME { get; set; }

        [MaxLength(200)]
        public string COURSENAME { get; set; }

        [MaxLength(50)]
        public string DURATION { get; set; }

        // full name and father's name
        [MaxLength(300)]
        public string NAMEANDFATHERSNAME { get; set; }

        // dates
        public DateTime? DOJ { get; set; } // Date of Joining
        public DateTime? DOC { get; set; } // Date of Completion
        public DateTime? ISSUEDATE { get; set; }

        // audit
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
    }
}
