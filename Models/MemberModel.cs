using System;
using System.ComponentModel.DataAnnotations;

namespace OnlineGspApp.Models
{
    public class MemberModel
    {
        public MemberModel()
        {
            // Default values for VS 2013 (C#5)
            STATUS = "pending";
            CreatedAt = DateTime.UtcNow;
        }

        [Required]
        public string Id { get; set; }

        [Required, MaxLength(200)]
        public string NAME { get; set; }

        [Required, MaxLength(200)]
        public string Center { get; set; }

        // Unique
        [Required, MaxLength(200), EmailAddress]
        public string EMAIL { get; set; }

        [MaxLength(100)]
        public string ENROLNO { get; set; }

        [MaxLength(100)]
        public string ROLLNO { get; set; }

        // Address fields
        [MaxLength(250)]
        public string Address1 { get; set; }

        [MaxLength(250)]
        public string Address2 { get; set; }

        [MaxLength(50)]
        public string Phone { get; set; }

        [MaxLength(50)]
        public string PhoneAlternate { get; set; }

        [MaxLength(100)]
        public string State { get; set; }

        [MaxLength(100)]
        public string City { get; set; }

        [MaxLength(100)]
        public string District { get; set; }

        [MaxLength(50)]
        public string AadharCardNo { get; set; }

        [MaxLength(200)]
        public string Password { get; set; } // store hashed in real app

        // file paths
        public string PhotoOfOwner { get; set; }
        public string AadharCardImage { get; set; }
        public string CenterLogo { get; set; }

        public string CertificateImage { get; set; }
        public string LetterImage { get; set; }

        // Status/remarks
        public string STATUS { get; set; }
        public string REMARKS { get; set; }

        // audit
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
    }
}
