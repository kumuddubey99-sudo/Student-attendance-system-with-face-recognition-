import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, FaceEmbedding, Attendance, User
from ..schemas import FaceIdentifyRequest
from ..auth import get_current_user
from ..face_recognition import face_ai, DEFAULT_THRESHOLD

router = APIRouter(prefix="/api/recognition", tags=["Face Recognition"])

@router.post("/identify")
def identify_and_mark_attendance(
    req: FaceIdentifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch all registered student embeddings from database
    records = db.query(FaceEmbedding, Student).join(Student, FaceEmbedding.student_id == Student.id).all()

    registered_list = []
    for face_rec, student in records:
        try:
            emb_vector = json.loads(face_rec.embedding)
            registered_list.append({
                "id": student.id,
                "student_id": student.student_id,
                "name": student.name,
                "roll_number": student.roll_number,
                "course": student.course,
                "year": student.year,
                "division": student.division,
                "embedding": emb_vector
            })
        except Exception as e:
            print(f"[Recognition] Error parsing embedding for student {student.id}: {e}")

    # 2. Run face recognition
    threshold = req.threshold if req.threshold is not None else DEFAULT_THRESHOLD
    result = face_ai.identify_face(req.frame, registered_list, threshold=threshold)

    # 3. If recognized, process automatic attendance
    if result.get("success") and result.get("status") == "recognized":
        student_id = result["student_id"]
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")

        # Check whether attendance for that student already exists for today's date
        existing_attendance = db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.attendance_date == today_str
        ).first()

        if existing_attendance:
            result["attendance_status"] = "already_marked"
            result["attendance_message"] = "Attendance already marked today."
            result["attendance_time"] = existing_attendance.attendance_time
            result["attendance_date"] = existing_attendance.attendance_date
        else:
            # Create attendance record
            new_attendance = Attendance(
                student_id=student_id,
                attendance_date=today_str,
                attendance_time=time_str,
                status="Present",
                confidence=result["confidence"]
            )
            db.add(new_attendance)
            db.commit()
            db.refresh(new_attendance)

            result["attendance_status"] = "marked"
            result["attendance_message"] = "Attendance marked successfully."
            result["attendance_time"] = time_str
            result["attendance_date"] = today_str
            result["attendance_id"] = new_attendance.id

    return result
