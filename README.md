# AI Student Attendance System
### Face Recognition Based Student Attendance

> **BSc Information Technology (BSc IT) Capstone Project**  
> Developed by a team of 3 undergraduate IT students.

A complete, production-ready, full-stack facial biometric attendance management web application. It automates attendance logging for colleges and universities using deep facial embeddings, eliminating the delays and proxy attendance vulnerabilities of traditional paper rolls.

---

## 📌 Key Highlights & Features

- **No Manual DB Insertions Required:** Fully self-service user registration (Teachers/Admins) and student enrolment via the web UI.
- **Webcam-Based Face Registration:** Interactive camera tool captures 5 facial samples, checks for single-face alignment, and computes an average 128-dimensional ArcFace/SFace deep embedding.
- **Real-Time Automated Attendance:** Live camera feed detects student faces via OpenCV YuNet, extracts embeddings, calculates cosine similarity against SQLite-stored student vectors, and automatically logs attendance.
- **Duplicate Attendance Prevention:** Enforces one attendance mark per student per calendar date.
- **Real-Time Statistics Dashboard:** Live SQLite counts for Total Students, Present Today, Absent Today, Attendance Percentage, and a recent attendance log.
- **Student Profile & Analytics:** Displays student contact information, biometric status, total classes, days present/absent, and overall attendance percentage.
- **Reports & CSV Export:** Filter by date or course, view daily or student-wise summaries, and download official attendance logs in CSV format.
- **Biometric Privacy Safeguards:** Raw face images are processed in memory and never stored on disk. Only mathematical 128-float vectors are persisted.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Responsive across mobile, tablet, and desktop)
- **Icons:** Lucide React
- **Audio/Animation:** Motion / Tailwind UI

### Backend
- **Framework:** Python 3.11 + FastAPI
- **Web Server:** Uvicorn
- **Reverse Proxy:** Express.js (Node.js runtime bridging port 3000 to internal backend port 8001)
- **Authentication:** JWT (JSON Web Tokens) + Passlib with bcrypt password hashing

### Database & ORM
- **Database:** SQLite3
- **ORM:** SQLAlchemy with strict Foreign Key constraints and cascading deletes

### Artificial Intelligence & Computer Vision
- **Face Detection:** OpenCV YuNet ONNX Deep Neural Network (bounding boxes + 5 landmark keypoints)
- **Feature Extraction:** OpenCV SFace (ArcFace Architecture, 128-dimensional L2-normalized embeddings)
- **Matching Metric:** Cosine Similarity with configurable threshold (Default: 0.48)

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10 or v3.11)
- Webcam (built-in or USB external camera)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8001
uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

### 2. Full-Stack / Frontend Setup
From the project root directory:
```bash
# Install frontend dependencies
npm install

# Launch development server (starts Python backend + Vite reverse proxy on port 3000)
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📖 Complete Application Workflow

1. **Teacher/Admin Registration:** Create an account via `/register` (Teacher or Admin role).
2. **Login:** Authenticate via `/login` to obtain a JWT session token.
3. **Enroll Student:** Navigate to **Add Student** and input details (Student ID, Roll Number, Name, Course, Year, Division).
4. **Register Face Biometrics:** Navigate to **Register Face**, select the student, and click "Start Face Capture". The system records 5 frames and computes the 128-d ArcFace vector.
5. **Mark Attendance:** Navigate to **Mark Attendance**. As the student faces the webcam, OpenCV recognizes the student and logs their attendance in SQLite with date, time, and confidence score.
6. **Generate Reports:** Visit **Reports** to inspect daily logs or student-wise percentages, and click **Export CSV** for institutional records.

---

## 🔒 Biometric Privacy Notice

This application adheres to privacy-by-design principles:
- **No Raw Photographs Stored:** Only 128-dimensional numerical vectors are stored in SQLite. Raw webcam frames are immediately discarded.
- **Local Edge Processing:** All face detection and feature comparison occur entirely within the local container or institutional server. No student biometric data is transmitted to third-party commercial APIs.

---

## 👥 Authors
Developed as a BSc IT Capstone Project by 3 undergraduate students:
- Student 1 (AI & Computer Vision Model Pipeline)
- Student 2 (Backend FastAPI, Database & Authentication)
- Student 3 (Frontend React UI, Camera Integration & Reports)
