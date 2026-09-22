import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from ..database import get_db
from ..models import Student, FaceEmbedding, Attendance, User
from ..schemas import StudentCreate, StudentUpdate, StudentResponse, FaceRegisterRequest
from ..auth import get_current_user
from ..face_recognition import face_ai

router = APIRouter(prefix="/api/students", tags=["Students"])

def student_to_dict(student: Student) -> dict:
    has_face = len(student.face_embeddings) > 0
    return {
        "id": student.id,
        "student_id": student.student_id,
        "roll_number": student.roll_number,
        "name": student.name,
        "email": student.email,
        "phone": student.phone,
        "course": student.course,
        "year": student.year,
        "division": student.division,
        "face_status": "Registered" if has_face else "Not Registered",
        "created_at": student.created_at
    }

@router.get("", response_model=List[StudentResponse])
def get_students(
    search: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.name.ilike(search_term),
                Student.roll_number.ilike(search_term),
                Student.student_id.ilike(search_term)
            )
        )
    if course:
        query = query.filter(Student.course == course)

    students = query.order_by(Student.roll_number.asc()).all()
    return [student_to_dict(s) for s in students]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate unique student_id
    existing_id = db.query(Student).filter(Student.student_id == student_in.student_id.strip()).first()
    if existing_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student ID '{student_in.student_id}' is already registered."
        )

    # Validate unique roll_number
    existing_roll = db.query(Student).filter(Student.roll_number == student_in.roll_number.strip()).first()
    if existing_roll:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Roll Number '{student_in.roll_number}' is already assigned to another student."
        )

    new_student = Student(
        student_id=student_in.student_id.strip(),
        roll_number=student_in.roll_number.strip(),
        name=student_in.name.strip(),
        email=student_in.email.strip().lower() if student_in.email else None,
        phone=student_in.phone.strip() if student_in.phone else None,
        course=student_in.course.strip(),
        year=student_in.year.strip(),
        division=student_in.division.strip().upper()
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return {
        "success": True,
        "message": "Student registered successfully.",
        "student": student_to_dict(new_student)
    }

@router.get("/{id}")
def get_student_details(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    # Calculate attendance metrics
    # Total unique attendance dates recorded across all classes in the college
    total_dates_count = db.query(func.count(func.distinct(Attendance.attendance_date))).scalar() or 0
    # Number of present records for this student
    present_count = db.query(Attendance).filter(
        Attendance.student_id == id,
        Attendance.status == "Present"
    ).count()

    total_classes = max(total_dates_count, present_count)
    absent_count = max(0, total_classes - present_count)
    percentage = round((present_count / total_classes * 100), 1) if total_classes > 0 else 0.0

    # Attendance history
    history = db.query(Attendance).filter(Attendance.student_id == id).order_by(Attendance.attendance_date.desc(), Attendance.attendance_time.desc()).all()

    history_list = [
        {
            "id": h.id,
            "attendance_date": h.attendance_date,
            "attendance_time": h.attendance_time,
            "status": h.status,
            "confidence": h.confidence,
            "created_at": h.created_at
        }
        for h in history
    ]

    return {
        "student": student_to_dict(student),
        "metrics": {
            "total_classes": total_classes,
            "present": present_count,
            "absent": absent_count,
            "percentage": percentage
        },
        "history": history_list
    }

@router.put("/{id}")
def update_student(
    id: int,
    student_in: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if student_in.student_id and student_in.student_id.strip() != student.student_id:
        existing = db.query(Student).filter(Student.student_id == student_in.student_id.strip()).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student ID already in use")
        student.student_id = student_in.student_id.strip()

    if student_in.roll_number and student_in.roll_number.strip() != student.roll_number:
        existing = db.query(Student).filter(Student.roll_number == student_in.roll_number.strip()).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Roll number already in use")
        student.roll_number = student_in.roll_number.strip()

    if student_in.name:
        student.name = student_in.name.strip()
    if student_in.email is not None:
        student.email = student_in.email.strip().lower() if student_in.email else None
    if student_in.phone is not None:
        student.phone = student_in.phone.strip() if student_in.phone else None
    if student_in.course:
        student.course = student_in.course.strip()
    if student_in.year:
        student.year = student_in.year.strip()
    if student_in.division:
        student.division = student_in.division.strip().upper()

    db.commit()
    db.refresh(student)
    return {"success": True, "message": "Student updated successfully", "student": student_to_dict(student)}

@router.delete("/{id}")
def delete_student(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"success": True, "message": "Student deleted successfully"}

@router.post("/{id}/register-face")
def register_student_face(
    id: int,
    req: FaceRegisterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if not req.samples or len(req.samples) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least 3-5 face samples for accurate biometric registration."
        )

    success, message, embedding_vector = face_ai.process_registration_samples(req.samples)

    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    # Delete any prior face embeddings for this student to ensure updated clean template
    db.query(FaceEmbedding).filter(FaceEmbedding.student_id == id).delete()

    # Save the new normalized ArcFace/SFace embedding vector
    embedding_record = FaceEmbedding(
        student_id=id,
        embedding=json.dumps(embedding_vector)
    )
    db.add(embedding_record)
    db.commit()

    return {
        "success": True,
        "message": "Face registered successfully.",
        "face_status": "Registered",
        "sample_count": len(req.samples)
    }
