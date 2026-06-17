# AI-Based Medical Report Analysis and Recommendation System

**Bachelor of Technology (B.Tech.) — Final Year Project**
**Computer Science & Engineering**
**University College of Engineering & Technology (UCET)**
**Vinoba Bhave University, Hazaribag — 825301, Jharkhand**

---

**Submitted by:**

| S.No. | Name | Roll No. |
|-------|------|----------|
| 1 | Sanjeet Kumar Gupta | 2209134 |
| 2 | Ujjwal Mandal | 2209149 |
| 3 | Khushi Kumari | 2209118 |
| 4 | Jinid Tuti | 2209116 |

**Supervisor:** Rahul Ranjan, Assistant Professor, UCET, VBU
**H.O.D:** Arun Mishra, Assistant Professor, UCET, VBU

---

> ⚠️ **Medical Disclaimer:** This system is developed strictly for educational and research purposes as part of a B.Tech final year project. It is NOT a certified medical device and must NOT be used as a substitute for professional medical advice, diagnosis, or treatment. All outputs must be verified by licensed medical practitioners before any clinical application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Core Features](#6-core-features)
7. [AI Pipeline](#7-ai-pipeline)
8. [Security & Privacy](#8-security--privacy)
9. [Project Structure](#9-project-structure)
10. [Installation & Setup](#10-installation--setup)
11. [Environment Configuration](#11-environment-configuration)
12. [Running the Application](#12-running-the-application)
13. [API Endpoints](#13-api-endpoints)
14. [Database Schema](#14-database-schema)
15. [Privacy & Data Protection](#15-privacy--data-protection)
16. [Screenshots & UI](#16-screenshots--ui)
17. [Future Scope](#17-future-scope)
18. [References](#18-references)

---

## 1. Project Overview

Medical reports — including laboratory results, radiology reports, and pathology findings — contain critical health information written in highly technical medical language. The majority of patients struggle to understand their own diagnostic documents, leading to poor health literacy, reduced engagement in care decisions, and unnecessary anxiety.

This project presents an end-to-end, AI-powered web application that:

- Accepts medical reports in PDF or image format
- Automatically extracts text using OCR (Optical Character Recognition)
- Removes all personally identifiable information (PII) before AI processing
- Uses a locally running Large Language Model (Ollama — llama3.2:3b) to convert complex medical language into simple, easy-to-understand explanations
- Generates health precautions, short-term and long-term consequences, and diet advice
- Allows patients to ask follow-up questions about their own report in plain language
- Stores all user data in encrypted form in a MongoDB database
- Sends OTP-based email verification for registration and password reset

The system is entirely offline-capable on the AI side (Ollama runs locally), ensuring patient data is never sent to external AI services.

---

## 2. Problem Statement

Modern medical reports are written for healthcare professionals — not patients. This creates multiple real-world problems:

- **Patient Comprehension Gap:** Patients cannot understand their own diagnostic documents due to medical jargon, Latin abbreviations, and complex terminology.
- **Anxiety and Misinterpretation:** Patients who attempt to interpret reports without guidance often misread results, causing unnecessary fear or, worse, ignoring serious findings.
- **Clinician Overload:** Healthcare providers spend significant time re-explaining reports to patients in already time-constrained consultations.
- **No Integrated Solution:** Existing tools either target clinicians (ChatEHR, Chart Hero) or answer generic medical questions (Med-PaLM) — none focus on simplifying individual patient reports with personalized consequences and diet guidance.

**Core Question:** How can an AI system automatically process raw medical reports and generate patient-friendly explanations, health precautions, consequences of ignoring the condition, and dietary guidance — while ensuring complete privacy and data security?

---

## 3. Objectives

The project aims to achieve the following measurable objectives:

- **OCR-Based Text Extraction:** Process PDF and image-format medical reports with ~90% character recognition accuracy using Tesseract.js v5
- **PII De-identification:** Strip all patient personal information (name, age, sex, address, phone, Aadhar) before any AI processing
- **Report Simplification:** Convert medical jargon into plain language (Grade 8 reading level) using Ollama LLM
- **Precaution Generation:** Generate 3 concise, actionable health precautions from report findings
- **Consequence Analysis:** Produce short-term (days/weeks) and long-term (months/years) health consequences if the condition is left untreated
- **Diet Guidance:** Provide condition-specific dietary recommendations
- **Interactive Q&A:** Allow users to ask natural language questions about their report
- **Secure Authentication:** Implement OTP-based email verification for registration and password reset
- **Data Encryption:** Store sensitive user data (name, email) encrypted using AES-256-CBC at rest in MongoDB
- **Cloud Storage:** Upload and manage medical report files through Cloudinary
- **HIPAA-Aligned Privacy:** Ensure no patient PII is exposed during AI processing or in AI-generated output

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER (Browser)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│              FRONTEND — React.js + Vite + Tailwind CSS          │
│   Home | Login | Register | OTP Verify | Dashboard | Report     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────────┐
│              BACKEND — Node.js + Express.js                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │ Auth Routes  │  │ Report Routes │  │  Middleware           │  │
│  │ /api/auth/*  │  │ /api/reports/*│  │  JWT | Helmet | CORS  │  │
│  └──────────────┘  └───────┬───────┘  └──────────────────────┘  │
└──────────────────────────┬─┴───────────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────────┐
         │                 │                      │
┌────────▼──────┐ ┌────────▼──────────┐ ┌────────▼────────┐
│  MongoDB      │ │  Ollama (Local)   │ │  Cloudinary     │
│  (Encrypted)  │ │  llama3.2:3b      │ │  (File Storage) │
│  Users        │ │  localhost:11434  │ │  medai-reports/ │
│  Reports      │ └───────────────────┘ └─────────────────┘
└───────────────┘
         │
┌────────▼──────┐
│  Gmail SMTP   │
│  (OTP Emails) │
└───────────────┘
```

### Data Flow (Report Analysis Pipeline)

```
1. User uploads PDF/Image
        ↓
2. Multer → Cloudinary (file stored in cloud)
        ↓
3. OCR Service (Tesseract.js) → Extracts raw text
        ↓
4. De-identification Service → Strips name, age, sex, address, phone
        ↓
5. Ollama AI (7 parallel prompts):
   ├─ Simplify Report
   ├─ Precautions (3 points)
   ├─ Short-term consequences (3 points)
   ├─ Long-term consequences (3 points)
   └─ Diet Advice (3 points)
        ↓
6. MongoDB → Save results (encrypted)
        ↓
7. Frontend → Display results to user
```

---

## 5. Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | v18+ | Runtime environment |
| Express.js | ^4.18.2 | Web framework |
| MongoDB | Atlas / Local | Database |
| Mongoose | ^8.0.3 | ODM for MongoDB |
| Tesseract.js | ^5.0.4 | OCR — text from images |
| pdf-parse | ^1.1.1 | Text extraction from PDFs |
| Ollama | local | LLM inference engine |
| Cloudinary | ^1.41.3 | Cloud file storage |
| Nodemailer | ^8.0.10 | OTP email delivery |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| helmet | ^7.1.0 | HTTP security headers |
| express-rate-limit | ^7.1.5 | API rate limiting |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React.js | ^18.2.0 | UI library |
| Vite | ^5.0.8 | Build tool |
| Tailwind CSS | ^3.4.0 | Utility-first styling |
| Framer Motion | ^12.40.0 | Animations |
| React Router DOM | ^6.21.0 | Client-side routing |
| React Markdown | ^10.1.0 | Render AI markdown output |
| Axios | ^1.6.2 | HTTP client |
| React Toastify | ^9.1.3 | Notifications |
| React Icons | ^5.0.1 | Icon library |

### AI / ML
| Component | Details |
|-----------|---------|
| Ollama | Local LLM inference engine |
| llama3.2:3b | Primary model (fast, 2GB) |
| meditron:7b | Medical-specific model (optional, 4GB) |

---

## 6. Core Features

### Authentication System
- User registration with OTP email verification (6-digit OTP, 10-minute expiry)
- Secure login with JWT token (7-day expiry)
- Forgot password with OTP-based reset (not link-based)
- Resend OTP with 60-second countdown
- Auto-login after successful OTP verification

### Report Analysis
- Upload PDF or image medical reports (max 10MB)
- Real-time 7-step loading animation showing current processing stage
- AI-generated output with 5 distinct sections:
  1. **What Your Report Says** — plain language simplification
  2. **Precautions** — 3 actionable safety measures
  3. **Short-term Effects** — consequences within days/weeks if ignored
  4. **Long-term Effects** — consequences over months/years if untreated
  5. **Diet Advice** — condition-specific nutritional guidance
- Interactive Q&A — ask any question about your report in plain language
- All AI output rendered as formatted Markdown (bold, bullet points, headings)

### Dashboard
- View all previously uploaded reports
- Report history with upload date and processing time
- Delete reports (removes from both Cloudinary and MongoDB)
- One-click navigation to any past report

### Homepage
- Modern animated landing page with Framer Motion
- Animated statistics counter (reports analyzed, accuracy, users)
- Features section, How It Works, Testimonials
- Fully responsive (mobile + desktop)

---

## 7. AI Pipeline

The system uses **Ollama** running locally on the machine. This means:
- No patient data is sent to external AI services (OpenAI, Google, etc.)
- Completely offline AI processing
- No API costs
- Full data sovereignty

### Supported Models
```bash
# Recommended (fast, good quality)
ollama pull llama3.2:3b

# Medical-specific (better accuracy, slower)
ollama pull meditron:7b
```

### Prompt Engineering Strategy
Each section uses a carefully engineered prompt with:
- Clear role definition (medical expert translator)
- Strict output format instructions (ONE sentence per point, no numbering)
- Hard privacy instruction: `IMPORTANT: Do NOT mention any personal information such as patient name, age, sex, address`
- Token limits per section to control response length

### De-identification Before AI
Before any text is sent to Ollama, the `deidentifyService` removes:
- Patient name (regex pattern matching)
- Age and date of birth
- Sex / gender
- Phone numbers
- Email addresses
- Physical addresses
- Aadhar / ID numbers
- Titles (Mr, Mrs, Dr) followed by names

---

## 8. Security & Privacy

### Data Encryption at Rest
User personal data is encrypted in MongoDB using **AES-256-CBC**:

```
name  → AES-256-CBC encrypted  (iv:encryptedHex format)
email → AES-256-CBC encrypted  (iv:encryptedHex format)
emailHash → SHA-256 hash       (used for fast lookups)
password → bcrypt hash (salt rounds: 10)
```

### JWT Authentication
- All protected routes require a valid JWT token
- Token passed in `Authorization: Bearer <token>` header
- Token expires in 7 days
- Invalid/expired tokens return 401 Unauthorized

### Other Security Measures
| Measure | Implementation |
|---------|---------------|
| HTTP Security Headers | helmet.js |
| Rate Limiting | 100 requests / 15 minutes per IP |
| CORS | Restricted to frontend URL only |
| File Validation | Type + size check before upload |
| OTP Hashing | SHA-256 before storing in DB |
| PII Stripping | Before every AI call |
| Medical Disclaimer | Shown on every output page |

---

## 9. Project Structure

```
med ai/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Cloudinary + multer config
│   ├── controllers/
│   │   ├── authController.js    # Register, Login, OTP, Reset
│   │   └── reportController.js  # Upload, Analyze, Delete, Q&A
│   ├── middleware/
│   │   ├── auth.js              # JWT protect middleware
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── User.js              # User schema (AES-256 encrypted)
│   │   └── Report.js            # Report schema
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/*
│   │   └── reportRoutes.js      # /api/reports/*
│   ├── services/
│   │   ├── ollamaService.js     # AI analysis (5 sections)
│   │   ├── ocrService.js        # Tesseract + pdf-parse
│   │   ├── emailService.js      # OTP + Welcome emails
│   │   └── deidentifyService.js # PII removal
│   ├── uploads/                 # Temporary (Cloudinary used)
│   ├── .env                     # Environment variables (git-ignored)
│   ├── .env.example             # Template for .env
│   └── server.js                # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── generated-image.png  # Favicon
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx # Protected route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Login.jsx        # Login form
│   │   │   ├── Register.jsx     # Registration form
│   │   │   ├── VerifyOTP.jsx    # OTP verification
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Dashboard.jsx    # Report upload + history
│   │   │   └── ReportDetail.jsx # Analysis output
│   │   ├── utils/
│   │   │   └── api.js           # Axios instance
│   │   ├── App.jsx              # Router + routes
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind + global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── .gitignore                   # Excludes .env, uploads, node_modules
```

---

## 10. Installation & Setup

### Prerequisites
Make sure the following are installed on your system:

- Node.js v18 or higher
- MongoDB (local) or MongoDB Atlas account
- Ollama — download from https://ollama.com
- Git

### Step 1 — Install Ollama Model
```bash
# Start Ollama (it may already be running)
ollama serve

# Pull the AI model (one-time download, ~2GB)
ollama pull llama3.2:3b
```

### Step 2 — Clone / Open Project
```bash
cd "med ai"
```

### Step 3 — Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 4 — Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 11. Environment Configuration

Create a `.env` file inside the `backend/` folder with the following:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/medai
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medai

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=7d

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=Medical AI <your-gmail@gmail.com>

# Encryption (must be exactly 32 characters)
ENCRYPTION_KEY=medai2024securekeyvbu32charslong

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password Setup
1. Go to https://myaccount.google.com
2. Security → Enable 2-Step Verification
3. Search "App Passwords"
4. Generate password for Mail / Windows
5. Paste the 16-character password in `EMAIL_PASS`

---

## 12. Running the Application

Open **3 separate terminals:**

**Terminal 1 — Ollama (if not already running):**
```bash
ollama serve
```

**Terminal 2 — Backend:**
```bash
cd backend
npm run dev
```
Expected output:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
🤖 Ollama URL: http://localhost:11434
🧠 AI Model: llama3.2:3b
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev
```

Open your browser at: **http://localhost:3000**

---

## 13. API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register + send OTP | No |
| POST | `/verify-otp` | Verify OTP (register/login) | No |
| POST | `/login` | Login with email + password | No |
| POST | `/resend-otp` | Resend OTP | No |
| POST | `/forgot-password` | Send reset OTP | No |
| POST | `/reset-password` | Reset password with OTP | No |
| GET | `/me` | Get current user info | Yes |

### Reports — `/api/reports`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload + analyze report | Yes |
| GET | `/` | Get all user reports | Yes |
| GET | `/:id` | Get single report | Yes |
| DELETE | `/:id` | Delete report | Yes |
| POST | `/:id/ask` | Ask question about report | Yes |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## 14. Database Schema

### Users Collection
```javascript
{
  name:               String  // AES-256 encrypted
  email:              String  // AES-256 encrypted
  emailHash:          String  // SHA-256 hash (for lookups)
  password:           String  // bcrypt hashed (select: false)
  role:               String  // 'user' | 'admin'
  isVerified:         Boolean
  otp:                String  // SHA-256 hashed (select: false)
  otpExpire:          Date    // (select: false)
  otpPurpose:         String  // 'register' | 'reset' | null
  resetPasswordToken: String
  resetPasswordExpire:Date
  createdAt:          Date
}
```

### Reports Collection
```javascript
{
  userId:                 ObjectId  // Reference to User
  fileName:               String
  fileUrl:                String    // Cloudinary URL
  cloudinaryPublicId:     String    // For deletion
  fileType:               String    // 'pdf' | 'image'
  reportType:             String    // 'laboratory' | 'radiology' etc.
  originalText:           String    // Raw OCR text
  simplifiedText:         String    // AI simplified explanation
  precautions:           [String]   // 3 precautions
  shortTermConsequences: [String]   // 3 short-term effects
  longTermConsequences:  [String]   // 3 long-term effects
  dietAdvice:            [String]   // 3 diet tips
  processingTime:         Number    // Seconds taken
  status:                 String    // 'processing' | 'completed' | 'failed'
  uploadDate:             Date
}
```

---

## 15. Privacy & Data Protection

This project follows privacy-by-design principles:

### What is Encrypted
- User name → AES-256-CBC encrypted in MongoDB
- User email → AES-256-CBC encrypted in MongoDB
- Email lookup → Uses SHA-256 emailHash (never plain text)
- Password → bcrypt (10 salt rounds)
- OTP → SHA-256 hashed before storage

### What is Removed Before AI Processing
The `deidentifyService.js` removes the following from every report before sending to Ollama:
- Patient full name
- Age / Date of Birth
- Sex / Gender
- Phone numbers
- Email addresses
- Physical addresses, city, state, PIN code
- Aadhar numbers and ID numbers
- Titles (Mr/Mrs/Dr) followed by names

### What AI Never Sees
- Patient name, age, sex, or any personal identity
- The AI model (Ollama) runs locally — no data leaves the machine

### What is Stored in Cloud
- Medical report files → Cloudinary (encrypted in transit via HTTPS)
- User data → MongoDB (encrypted at rest)

---

## 16. Screenshots & UI

The application consists of the following screens:

1. **Homepage** — Animated landing page with features, how-it-works, statistics, testimonials
2. **Register** — Name, email, password form → OTP sent to email
3. **OTP Verify** — 6-box OTP input with countdown timer and resend option
4. **Login** — Email and password → Direct dashboard access
5. **Forgot Password** — Email input → OTP sent
6. **Reset Password** — OTP boxes + new password fields
7. **Dashboard** — File upload with 7-step animated loading overlay + reports history
8. **Report Output** — 5 sections (Report Explanation, Precautions, Short-term Effects, Long-term Effects, Diet Advice) + Q&A

---

## 17. Future Scope

The following enhancements are planned for future versions:

- **Multilingual Support** — Hindi, Bengali, Tamil, and other regional language output
- **Mobile Application** — React Native app for Android and iOS
- **EHR Integration** — HL7/FHIR standard compatibility for hospital systems
- **Federated Learning** — Privacy-preserving model improvement across institutions
- **Report History Timeline** — Visual health timeline based on past reports
- **Specialist Routing** — Suggest which type of doctor to consult based on findings
- **Voice Output** — Text-to-speech for patients with low literacy
- **Severity Score** — Automated urgency rating (Routine / Attention Needed / Urgent)
- **PDF Export** — Download AI-generated report analysis as a formatted PDF
- **Admin Dashboard** — Analytics panel for monitoring system usage

---

## 18. References

1. Damasio, J. et al. (2025). "Development and evaluation of a clinical note summarisation system using large language models." *Journal of Medical Internet Research.*

2. Bednarczyk, F. et al. (2025). "Scientific evidence for clinical text summarisation using large language models: scoping review." *JMIR, 27.*

3. Nguyen, D. T. et al. (2025). "Medalyze: Lightweight medical report summarisation app using FLAN-T5." *arXiv preprint.*

4. Johnson, A. E. W. et al. (2016). "MIMIC-III, a freely accessible critical care database." *Scientific Data, 3, 160035.*

5. Neumann, M. et al. (2019). "ScispaCy: Fast and robust models for biomedical NLP." *BioNLP Workshop, 319–327.*

6. Lee, J. et al. (2020). "BioBERT: A pre-trained biomedical language representation model." *Bioinformatics, 36(4), 1234–1240.*

7. Luo, H. P. et al. (2022). "BioGPT: Generative pre-trained transformer for biomedical text generation." *Briefings in Bioinformatics.*

8. Google Research (2023). "Towards expert-level medical question answering with large language models (Med-PaLM 2)." *Nature.*

9. Chinta, S. V. et al. (2025). "AI-driven healthcare: Fairness in AI healthcare — a survey." *PLOS Digital Health.*

10. Mayover, T. (2025). "When AI Technology and HIPAA Collide." *HIPAA Journal.*

11. Ollama Documentation — https://ollama.com

12. Cloudinary Documentation — https://cloudinary.com/documentation

13. MongoDB Documentation — https://www.mongodb.com/docs

14. Tesseract.js Documentation — https://tesseract.projectnaptha.com

---

## Team

This project was developed as a final year B.Tech project by students of Computer Science & Engineering at UCET, VBU, Hazaribag.

| Name | Roll No. | Contribution |
|------|----------|-------------|
| Sanjeet Kumar Gupta | 2209134 | Backend Development, AI Integration, Database Design |
| Ujjwal Mandal | 2209149 | Frontend Development, UI/UX Design, API Integration |
| Khushi Kumari | 2209118 | OCR Pipeline, Security Implementation, Testing |
| Jinid Tuti | 2209116 | Email Service, Documentation, Deployment |

---

*This project was developed under the guidance of Rahul Ranjan, Assistant Professor, UCET, VBU, Hazaribag — 2024*

---

> **Note:** This is a research prototype built for academic purposes. The system is intended for educational demonstration only and should not be relied upon for actual medical decision-making without the oversight of qualified healthcare professionals.
