from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from ..database import get_db
from ..models import Attendance, Student, User
from ..schemas import AttendanceResponse, AttendanceMarkManual
from ..auth import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

def attendance_to_dict(rec: Attendance, student: Student) -> dict:
    return {
        "id": rec.id,
        "student_id": rec.student_id,
        "student_name": student.name,
        "roll_number": student.roll_number,
        "student_uid": student.student_id,
        "course": student.course,
        "year": student.year,
        "division": student.division,
        "attendance_date": rec.attendance_date,
        "attendance_time": rec.attendance_time,
        "status": rec.status,
        "confidence": rec.confidence,
        "created_at": rec.created_at
    }

@router.get("", response_model=List[AttendanceResponse])
def get_attendance_records(
    date: Optional[str] = Query(None, description="Date filter YYYY-MM-DD"),
    search: Optional[str] = Query(None, description="Search name, roll no, or student id"),
    course: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Attendance, Student).join(Student, Attendance.student_id == Student.id)

    if date:
        query = query.filter(Attendance.attendance_date == date.strip())

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.name.ilike(term),
                Student.roll_number.ilike(term),
                Student.student_id.ilike(term)
            )
        )

    if course:
        query = query.filter(Student.course == course.strip())

    records = query.order_by(Attendance.attendance_date.desc(), Attendance.attendance_time.desc()).limit(limit).all()
    return [attendance_to_dict(att, stu) for att, stu in records]

@router.get("/today", response_model=List[AttendanceResponse])
def get_today_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today_str = datetime.now().strftime("%Y-%m-%d")
    records = db.query(Attendance, Student).join(Student, Attendance.student_id == Student.id).filter(
        Attendance.attendance_date == today_str
    ).order_by(Attendance.attendance_time.desc()).all()

    return [attendance_to_dict(att, stu) for att, stu in records]

@router.get("/student/{id}", response_model=List[AttendanceResponse])
def get_student_attendance(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    records = db.query(Attendance).filter(Attendance.student_id == id).order_by(
        Attendance.attendance_date.desc(), Attendance.attendance_time.desc()
    ).all()

    return [attendance_to_dict(att, student) for att in records]

@router.post("/mark", status_code=status.HTTP_201_CREATED)
def mark_attendance_manual(
    req: AttendanceMarkManual,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    now = datetime.now()
    att_date = req.attendance_date or now.strftime("%Y-%m-%d")
    att_time = req.attendance_time or now.strftime("%H:%M:%S")

    existing = db.query(Attendance).filter(
        Attendance.student_id == req.student_id,
        Attendance.attendance_date == att_date
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Attendance already marked for {student.name} on {att_date}."
        )

    new_att = Attendance(
        student_id=student.id,
        attendance_date=att_date,
        attendance_time=att_time,
        status=req.status,
        confidence=100.0
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)

    return {
        "success": True,
        "message": f"Attendance marked for {student.name}.",
        "attendance": attendance_to_dict(new_att, student)
    }
