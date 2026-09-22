from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Student, Attendance, User
from ..auth import get_current_user
from .attendance import attendance_to_dict

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    current_time_str = now.strftime("%H:%M:%S")

    # 1. Total students count
    total_students = db.query(func.count(Student.id)).scalar() or 0

    # 2. Present today count (distinct students marked present on today's date)
    present_today = db.query(func.count(Attendance.id)).filter(
        Attendance.attendance_date == today_str,
        Attendance.status == "Present"
    ).scalar() or 0

    # 3. Absent today
    absent_today = max(0, total_students - present_today)

    # 4. Attendance percentage
    attendance_pct = round((present_today / total_students * 100), 1) if total_students > 0 else 0.0

    # 5. Recent attendance records (latest 10)
    recent_records = db.query(Attendance, Student).join(
        Student, Attendance.student_id == Student.id
    ).order_by(
        Attendance.attendance_date.desc(), Attendance.attendance_time.desc()
    ).limit(10).all()

    recent_attendance = [attendance_to_dict(att, stu) for att, stu in recent_records]

    return {
        "total_students": total_students,
        "present_today": present_today,
        "absent_today": absent_today,
        "attendance_percentage": attendance_pct,
        "today_date": today_str,
        "current_time": current_time_str,
        "recent_attendance": recent_attendance
    }
