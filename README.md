<div align="center">

# 🎓 UniMinds AI

### Next-Generation Academic ERP & Intelligent Campus Cloud Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-PostgreSQL_/_Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/AI_Engine-Groq_Llama3-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)

<p align="center">
  <a href="https://unimind-backend.vercel.app/"><strong>🌐 Live Prototype / Deployment</strong></a> &bull;
  <a href="#-key-features"><strong>✨ Key Features</strong></a> &bull;
  <a href="#-role-based-access-control-rbac"><strong>👥 User Roles</strong></a> &bull;
  <a href="#-quick-start"><strong>🚀 Quick Start</strong></a> &bull;
  <a href="#-api-documentation"><strong>📖 API Docs</strong></a>
</p>

</div>

---

## 📌 Project Overview

**UniMinds AI** is a comprehensive, full-stack Academic Management & AI Campus ERP designed for modern universities and colleges. Built with a **FastAPI** backend and a **React 19 + Vite** frontend, it streamlines operations across students, parents, faculty, and administrators.

The user interface follows a modern **Apple / Lingora-inspired EdTech SaaS aesthetic** with soft backgrounds (`#F4F7FC`), electric blue accents (`#1E6BFF`), pure white floating cards, and full mobile/desktop responsiveness.

🔗 **Live Prototype:** [https://unimind-backend.vercel.app/](https://unimind-backend.vercel.app/)  
📖 **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs` (when running locally)

---

## ✨ Key Features

### 🎓 1. Student Portal
* **Central Dashboard:** Today's timetable, overall attendance percentage, pending assignment counters, upcoming examinations, fee summary, and announcements.
* **Attendance Tracking:** Overall & subject-wise attendance tracking with color-coded warning badges (`<75%` low-attendance alert) and a safe-leave calculator.
* **Smart Timetable:** Interactive daily and weekly schedule with live class status, room numbers, subject codes, and faculty details.
* **Assignments & Assessments:** Submit assignments with attachments, view faculty remarks/grades, and take timed online MCQ tests with instant evaluation.
* **Examinations & Report Cards:** End-semester schedules, room allocations, SGPA/CGPA history, and downloadable grade cards.
* **Fee Billing & Receipts:** Transparent fee breakdown (Tuition, Lab, Exam), paid vs. pending balances, and instant receipt generation.
* **Academic Resources & Documents:** Access lecture notes, study materials, and syllabus PDFs uploaded by faculty.
* **AI Academic Assistant (Chatbot):** Personalized AI tutor powered by Groq LLM providing attendance explanations, exam trend analysis, and study recommendations with instant academic ERP fallback.

### 👨‍👩‍👧 2. Parent Monitoring Portal
* **Child Overview:** Real-time visibility into the child's academic performance, CGPA, and semester standing.
* **Attendance Alerts:** Live status indicators and threshold warnings when student attendance drops below 75%.
* **Recent Scores & Mentor Remarks:** View Unit Test marks and teacher feedback directly.
* **Fee Notifications:** Upcoming payment due dates and billing history.

### 👨‍🏫 3. Faculty & Teacher Paper Studio
* **AI Question Paper Studio:** Upload past examination paper PDFs; Groq Vision / LLM automatically extracts, parses, and formats questions into structured digital tests.
* **Course Resource Distribution:** Publish subject notes and study materials.
* **Student Communication:** Direct messaging channel between faculty and students.

### 🛡️ 4. Admin ERP Control Center
* **Student Registration Portal:**
  * **Biometric Photograph Upload:** Drag-and-drop file upload (JPG, PNG, WebP up to 5MB) with real-time preview, change/remove controls, or automated avatar fallbacks.
  * **Designated Account Passwords:** Configure custom student login passwords during enrollment or use one-click secure password generation (`Auto-Gen Password`).
  * **Academic Allocation:** Assign course (B.Tech, BCA, MCA, MBA), branch (CSE, IT, ECE, ME, CE), semester (1 to 8), section, and academic batch.
  * **Contact & Parent Records:** Student mobile phone, college email, date of birth, blood group, guardian phone, and residential address.
* **Student Directory & Editing:**
  * Live search by name, university roll number, or contact phone.
  * Filter by semester and academic department.
  * **Edit Student Records:** Modal to update student details, modify semesters, and reset login passwords.
  * **Student Dossier Viewer:** One-click modal to inspect a student's complete institutional profile card.
* **Institutional Metrics:** High-level dashboard counters for total enrolled students, active faculty, revenue collected, and campus-wide average attendance.

---

## 👥 Role-Based Access Control (RBAC)

The system supports 4 designated personas with isolated permissions:

| Persona | Role | Default Username (Roll / Email) | Default Password | Primary Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student` | `210161010001` *or* `aaradhya.saxena@rbmi.in` | `student123` | `/dashboard` |
| **Student (Alt)** | `student` | `210161010002` *or* `rohan.gupta@rbmi.in` | `rohan123` | `/dashboard` |
| **Parent** | `parent` | `parent1@example.com` *or* `parent` | `parent123` | `/parent/dashboard` |
| **Faculty** | `teacher` | `teacher1@example.com` *or* `teacher` | `teacher123` | `/teacher/papers` |
| **System Admin** | `admin` | `admin1@example.com` *or* `admin` | `admin123` | `/admin` |

> 💡 **Note:** When the Admin registers any new student, that student can immediately log in using their **Roll Number** (or Email) and the **Password** configured during enrollment!

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    Client["React 19 + Vite Frontend\n(Tailwind CSS, Lucide Icons)"]
    API["FastAPI Backend (Port 8000)\n(main.py / api.py)"]
    AcademicStore["Academic ERP Data Store\n(academic_api.py)"]
    GroqAI["Groq AI Engine\n(Llama 3 / OpenAI OSS)"]
    DB[("PostgreSQL / Supabase\n(Row Level Security)")]

    Client <-->|"Axios (JSON / REST)"| API
    API <--> AcademicStore
    API <-->|"Async Client"| GroqAI
    API <-->|"SQLAlchemy / Client"| DB
```

### Backend
* **Language & Framework:** Python 3.12+ / 3.15, [FastAPI](https://fastapi.tiangolo.com/)
* **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
* **Data Validation:** [Pydantic v2](https://docs.pydantic.dev/)
* **Database / Auth:** PostgreSQL via [Supabase](https://supabase.com/) with Row Level Security (RLS)
* **AI Model Engine:** [Groq Cloud SDK](https://groq.com/) (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`)
* **PDF Processing:** `pypdf` / binary inspection

### Frontend
* **Core:** [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
* **Routing:** [React Router v7](https://reactrouter.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/), PostCSS, Autoprefixer
* **Icons:** [Lucide React](https://lucide.dev/)
* **HTTP Client:** [Axios](https://axios-http.com/)

---

## 📂 Project Structure

```
UniMinds AI/
├── main.py                  # Primary Uvicorn entrypoint alias
├── api.py                   # FastAPI app, CORS middleware, Groq chat & paper APIs
├── academic_api.py          # Academic ERP extension (attendance, timetable, admin)
├── chatbot.py               # AI academic reasoning & attendance calculations
├── upload_paper.py          # PDF question paper parsing & Groq extraction
├── check_groq.py            # Groq API connectivity diagnostic script
├── requirements.txt         # Backend Python dependencies
├── .env                     # Backend environment configuration
│
└── unimind-frontend/        # React frontend application
    ├── src/
    │   ├── components/      # Common UI components (NeoCard, NeoButton, NeoInput, etc.)
    │   │   ├── common/      # Modals, alerts, badges, loading spinners
    │   │   ├── layout/      # Navbar, Sidebar drawer, Mobile bottom nav, Footer
    │   │   ├── student/     # AttendanceWidget, FeesCard, MissedLecturesList
    │   │   └── teacher/     # PaperPreviewModal, QuestionEditor
    │   ├── context/         # AuthContext (RBAC, credentials session storage)
    │   ├── pages/           # StudentDashboard, AdminDashboard, ParentDashboard, etc.
    │   ├── services/        # Axios API handlers (academicService, chatService)
    │   ├── App.jsx          # Route definitions & layout wrappers
    │   └── main.jsx         # React application bootstrap
    ├── package.json         # Frontend dependencies and npm scripts
    ├── vite.config.js       # Vite configuration
    └── tailwind.config.js   # Custom colors (#1E6BFF), shadows, radii
```

---

## 🚀 Quick Start

### 1. Prerequisites
* **Python:** 3.11, 3.12, or 3.15 installed
* **Node.js:** v18.0.0 or higher
* **Package Manager:** `npm` or `pnpm`

---

### 2. Backend Setup

1. **Navigate to the project root:**
   ```bash
   cd "UniMinds AI"
   ```

2. **(Optional) Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables (`.env`):**
   Ensure a `.env` file exists in the root directory with:
   ```env
   # PostgreSQL / Supabase
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT_ID].supabase.co
   SUPABASE_KEY=[YOUR_SUPABASE_ANON_KEY]

   # AI Configuration (Groq)
   GROQ_API_KEY=gsk_[YOUR_GROQ_API_KEY]
   GROQ_MODEL=openai/gpt-oss-120b

   # CORS Allowed Origins
   FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://unimind-backend.vercel.app
   ```

5. **Run the FastAPI Server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will be live at `http://127.0.0.1:8000`.*

---

### 3. Frontend Setup

1. **Open a new terminal and navigate to `unimind-frontend`:**
   ```bash
   cd unimind-frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment (`.env.development` or `.env`):**
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000
   VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
   VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
   ```

4. **Start Vite Development Server:**
   ```bash
   npm run dev
   ```
   *The frontend will open at `http://localhost:5173` (or `http://127.0.0.1:5173`).*

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📖 API Documentation

FastAPI automatically generates interactive OpenAPI documentation:

* **Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Specification:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Key Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Healthcheck endpoint |
| `POST` | `/api/academic/auth/login` | Student & role login (Roll No or Email + Password) |
| `GET` | `/api/academic/profile` | Retrieve student/parent profile details |
| `GET` | `/api/academic/timetable` | Get day/weekly timetable slots |
| `GET` | `/api/academic/assignments` | List assignments with subject filtering |
| `POST` | `/api/academic/assignments/submit`| Submit student assignment file |
| `GET` | `/api/academic/assessments` | List available and completed online MCQ tests |
| `POST` | `/api/academic/assessments/submit` | Submit test answers and compute score |
| `GET` | `/api/academic/exams` | Examination datesheet schedule |
| `GET` | `/api/academic/results` | Semester-wise SGPA/CGPA grade card |
| `GET` | `/api/academic/fees` | Fee structure, paid amounts, and due dates |
| `GET` | `/api/academic/admin/summary` | High-level admin institutional statistics |
| `POST` | `/api/academic/admin/students` | Enroll student with photograph, semester, and password |
| `GET` | `/api/academic/admin/students/{id}`| Fetch complete student dossier |
| `PUT` | `/api/academic/admin/students/{id}`| Update student record and reset password |
| `DELETE`| `/api/academic/admin/students/{id}`| Unregister / delete student record |
| `POST` | `/api/chat` | AI Academic Assistant chat endpoint |
| `POST` | `/api/papers/preview` | PDF Question Paper AI question extraction |

---

## 🔒 Security & Performance Highlights

* **Cross-Origin Resource Sharing (CORS):** Dynamic regex matching (`r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$"`) eliminates dev-port preflight failures while allowing production Vercel origins.
* **Row-Level Security (RLS):** Supabase database locks guarantee that students can only inspect their own attendance and grades.
* **Graceful AI Degradation:** If external LLM APIs are unreachable, the AI chatbot seamlessly delivers computed deterministic ERP statistics (attendance %, leave buffer, marks) without crashing.
* **Responsive Mobile Optimization:** Bottom navigation bar, thumb-friendly modal dialogs, and horizontally scrollable tables designed for viewports down to 360px width.

---

## 📄 License & Attribution

Developed for **RBMI Group of Institutions, Bareilly** (AKTU B.Tech CSE Project).  
All rights reserved. Built with ❤️ by the UniMinds AI Team.
