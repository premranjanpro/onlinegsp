# 🎓 Gurukul The School Of Professionals (GSP Board)
### Official Web Portal, Student Result & Verification System

[![Website](https://img.shields.io/badge/Website-onlinegsp.com-0056b3?style=for-the-badge&logo=google-chrome&logoColor=white)](https://onlinegsp.com)
[![Certification](https://img.shields.io/badge/Certification-ISO%209001%3A2015-success?style=for-the-badge&logo=checkmarx&logoColor=white)](#)
[![Hosting](https://img.shields.io/badge/Deployment-GitHub%20Pages-181717?style=for-the-badge&logo=github&logoColor=white)](https://premranjanpro.github.io/onlinegsp/)
[![License](https://img.shields.io/badge/License-Proprietary-orange?style=for-the-badge)](#)

---

## 📌 Overview

**Gurukul The School Of Professionals (GSP)** is an **ISO 9001:2015 certified** premier educational board delivering vocational, technical, and professional skill development across India. 

This repository houses the complete static web application and portal engine, featuring a high-performance **Online Student Result Search**, **Certificate QR Verification System**, **Affiliation Center Locator**, and an **Admin Management Dashboard**.

🌐 **Live Website:** [https://onlinegsp.com](https://onlinegsp.com)

---

## 🚀 Key Features

### 🎓 1. Student Result & Marksheet Portal (`result.html`)
- **Instant Search:** Students can search records using their Enrollment / Registration Number.
- **Official Marksheet Generation:** Dynamically renders student details, subject-wise marks, grades, session, center code, and division.
- **Print & PDF Export:** One-click instant print / save as PDF with official watermarks and clean print layouts.

### 🔍 2. Live Certificate Verification Engine (`verify.html`)
- **Direct Query Parameter Support:** Verify certificates instantly via URL (e.g. `verify.html?regno=MGI/EE/21-24377518`).
- **QR Code Compatible:** Scan QR codes on physical certificates to open direct verification badges and authenticity checks.
- **Official Security Seals:** Displays verified authenticity status, issue date, and validation credentials.

### 🏛️ 3. Center Affiliation Network (`affiliation-*.html`)
- **Center Locator:** Searchable directory of affiliated study centers across India by state/city.
- **Online Affiliation Registration:** Application portal for new institutions seeking board affiliation.
- **Application Status Tracker:** Real-time tracking of affiliation applications.

### 📚 4. Course & Syllabus Directory (`courses.html`, `courses-list.html`)
- Comprehensive repository of technical, paramedical, management, vocational, and computer software/hardware diploma courses.
- Filterable listings with course duration, eligibility criteria, and fee structures.

### 🛠️ 5. Administrative Suite (`admin/`)
- Admin dashboard to manage courses, news announcements, member profiles, enquiries, and student result records.
- JSON-backed database handling for lightweight and portable deployment.

---

## 📂 Project Structure

```plaintext
onlinegsp/
├── .github/                     # GitHub workflows and config
├── admin/                       # Administration management pages
│   ├── index.html               # Admin login & dashboard
│   ├── results.html             # Student records management
│   ├── courses.html             # Course directory management
│   ├── members.html             # Center/Member management
│   ├── enquiries.html           # Inbound queries management
│   └── news.html                # Announcements management
├── css/                         # Stylesheets
│   ├── bootstrap.css            # Base grid and utility system
│   ├── portal-theme.css         # Modern design system & custom styles
│   └── responsive.css           # Mobile & tablet layout optimizations
├── db/                          # Static JSON datastores
│   ├── results.json             # Student marksheet & verification database
│   ├── courses.json             # Course catalog & syllabus details
│   ├── members.json             # Affiliated centers & branch list
│   └── enquiries.json           # Contact and registration queries
├── fonts/                       # Web fonts & glyph icons
├── images/                      # Assets, banners, logos, and badges
├── js/                          # Client-side scripts
├── index.html                   # Main landing page
├── result.html                  # Student Result search & marksheet viewer
├── verify.html                  # Certificate verification portal (QR target)
├── affiliation-location.html    # Center locator directory
├── affiliation-register.html    # Affiliation application form
├── affiliation-status.html      # Application tracking page
├── courses.html                 # Course directory page
├── courses-list.html            # Detailed course syllabus list
├── aboutus.html                 # About the organization
├── chairman-message.html        # Message from the Chairman
├── contact.html                 # Contact & support page
├── faq.html                     # Frequently asked questions
├── gallery.html                 # Campus & event gallery
├── news.html                    # Board notices & announcements
├── CNAME                        # Custom domain configuration (onlinegsp.com)
├── .nojekyll                    # Disables Jekyll processing on GitHub Pages
└── README.md                    # Project documentation
```

---

## 💻 Tech Stack

- **Frontend:** Semantic HTML5, Vanilla JavaScript (ES6+), CSS3
- **Design & UI:** Bootstrap, Custom Portal Theme with glassmorphism & gradients
- **Icons & Fonts:** Font Awesome 6.5, Google Fonts
- **Data Layer:** Client-side JSON Datastores (`db/results.json`, etc.)
- **Deployment:** GitHub Pages + Custom Domain DNS (`onlinegsp.com`)

---

## ⚡ Local Setup & Development

To run and preview the portal locally:

### Option 1: Using Python (Recommended)
```bash
# Clone the repository
git clone https://github.com/premranjanpro/onlinegsp.git

# Navigate into the project folder
cd onlinegsp

# Start a local HTTP server
python -m http.server 8080
```
Then open your browser and navigate to: `http://localhost:8080`

### Option 2: Using Node.js / `npx serve`
```bash
npx serve .
```

### Option 3: VS Code Live Server
1. Open the project folder in **VS Code**.
2. Right click on `index.html` and select **"Open with Live Server"**.

---

## 🔗 Direct URL Verification Format

The verification system supports deep linking for certificates and marksheets:

```
https://onlinegsp.com/verify.html?regno=<REGISTRATION_NUMBER>
```

**Example:**
- `https://onlinegsp.com/verify.html?regno=MGI/EE/21-24377518`

---

## 🌐 Deployment

This site is deployed on **GitHub Pages** with custom domain routing:
- **Custom Domain:** `onlinegsp.com` configured in `CNAME`
- **Jekyll Disabled:** `.nojekyll` file ensures directories like `_assets` or JSON files load without restrictions.

To deploy updates, simply push commits to the `main` branch:
```bash
git add .
git commit -m "Update portal content"
git push origin main
```

---

## 📄 License & Copyright

© **Gurukul The School Of Professionals (GSP)**. All Rights Reserved.  
*ISO 9001:2015 Certified Educational Organization.*
