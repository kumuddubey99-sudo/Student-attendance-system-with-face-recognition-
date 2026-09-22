import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, students, recognition, attendance, dashboard, reports
from .face_recognition import DEFAULT_THRESHOLD, YUNET_PATH, SFACE_PATH

# Automatically create all SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Student Attendance System API",
    description="Face Recognition Based Student Attendance System with OpenCV & ArcFace/SFace",
    version="1.0.0"
)

# Enable CORS for local dev and web preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(recognition.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)
app.include_router(reports.router)

@app.get("/api/health")
def health_check():
    ai_ready = os.path.exists(YUNET_PATH) and os.path.exists(SFACE_PATH)
    return {
        "status": "healthy",
        "app": "AI Student Attendance System",
        "ai_engine": "OpenCV YuNet + ArcFace/SFace DNN",
        "ai_models_loaded": ai_ready,
        "recognition_threshold": DEFAULT_THRESHOLD
    }

@app.get("/api/system-info")
def get_system_info():
    return {
        "project_name": "AI Student Attendance System",
        "subtitle": "Face Recognition Based Student Attendance",
        "academic_context": "BSc IT Final Year Project",
        "developers": ["Student 1", "Student 2", "Student 3"],
        "tech_stack": {
            "frontend": "React, Vite, Tailwind CSS",
            "backend": "Python, FastAPI",
            "database": "SQLite, SQLAlchemy",
            "ai_models": "OpenCV YuNet (Face Detection & Landmarks) + SFace (ArcFace Deep Embeddings)"
        },
        "recognition_threshold": DEFAULT_THRESHOLD,
        "privacy_notice": (
            "This application processes facial biometric feature vectors (embeddings) exclusively "
            "for academic attendance verification. Raw photographs are not retained. All processing "
            "is executed locally within the institutional deployment."
        )
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
