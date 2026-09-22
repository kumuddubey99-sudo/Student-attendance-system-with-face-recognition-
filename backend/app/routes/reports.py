import io
import csv
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Student, Attendance, User
from ..auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("")
def get_reports_summary(
    report_type: str = Query("daily", description="'daily' or 'student_wise'"),
    date: Optional[str] = Query(None, description="Date filter YYYY-MM-DD"),
    course: Optional[str] = Query(None),
    student_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today_str = datetime.now().strftime("%Y-%m-%d")
    target_date = date.strip() if date else today_str

    if report_type == "student_wise":
        # Aggregate per student
        students_query = db.query(Student)
        if course:
            students_query = students_query.filter(Student.course == course)
        if student_id:
            students_query = students_query.filter(Student.id == student_id)

        students = students_query.order_by(Student.roll_number.asc()).all()

        total_unique_dates = db.query(func.count(func.distinct(Attendance.attendance_date))).scalar() or 0

        student_reports = []
        for s in students:
            present_days = db.query(Attendance).filter(
                Attendance.student_id == s.id,
                Attendance.status == "Present"
            ).count()

            total_days = max(total_unique_dates, present_days)
            absent_days = max(0, total_days - present_days)
            percentage = round((present_days / total_days * 100), 1) if total_days > 0 else 0.0

            student_reports.append({
                "student_id": s.id,
                "student_uid": s.student_id,
                "roll_number": s.roll_number,
                "name": s.name,
                "course": s.course,
                "year": s.year,
                "division": s.division,
                "total_days": total_days,
                "present_days": present_days,
                "absent_days": absent_days,
                "attendance_percentage": percentage
            })

        return {
            "report_type": "student_wise",
            "filter_date": target_date,
            "total_records": len(student_reports),
            "data": student_reports
        }

    else:
        # Daily Report
        query = db.query(Attendance, Student).join(Student, Attendance.student_id == Student.id)
        if target_date:
            query = query.filter(Attendance.attendance_date == target_date)
        if course:
            query = query.filter(Student.course == course)

        records = query.order_by(Attendance.attendance_time.asc()).all()

        daily_data = [
            {
                "id": att.id,
                "student_id": att.student_id,
                "student_uid": stu.student_id,
                "roll_number": stu.roll_number,
                "student_name": stu.name,
                "course": stu.course,
                "year": stu.year,
                "division": stu.division,
                "attendance_date": att.attendance_date,
                "attendance_time": att.attendance_time,
                "status": att.status,
                "confidence": att.confidence
            }
            for att, stu in records
        ]

        return {
            "report_type": "daily",
            "filter_date": target_date,
            "total_records": len(daily_data),
            "data": daily_data
        }

@router.get("/export-csv")
def export_csv(
    report_type: str = Query("daily"),
    date: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    output = io.StringIO()
    writer = csv.writer(output)

    today_str = datetime.now().strftime("%Y-%m-%d")
    target_date = date.strip() if date else today_str

    if report_type == "student_wise":
        writer.writerow([
            "Student ID", "Roll Number", "Student Name", "Course", "Year", "Division",
            "Total Classes", "Present Days", "Absent Days", "Attendance Percentage"
        ])
        students_query = db.query(Student)
        if course:
            students_query = students_query.filter(Student.course == course)
        students = students_query.order_by(Student.roll_number.asc()).all()

        total_unique_dates = db.query(func.count(func.distinct(Attendance.attendance_date))).scalar() or 0

        for s in students:
            present_days = db.query(Attendance).filter(
                Attendance.student_id == s.id,
                Attendance.status == "Present"
            ).count()
            total_days = max(total_unique_dates, present_days)
            absent_days = max(0, total_days - present_days)
            pct = round((present_days / total_days * 100), 1) if total_days > 0 else 0.0

            writer.writerow([
                s.student_id, s.roll_number, s.name, s.course, s.year, s.division,
                total_days, present_days, absent_days, f"{pct}%"
            ])

        filename = f"attendance_student_wise_report_{today_str}.csv"

    else:
        # Standard attendance CSV format specified in requirement 14:
        # Student ID, Roll Number, Student Name, Date, Time, Status, Confidence
        writer.writerow([
            "Student ID", "Roll Number", "Student Name", "Date", "Time", "Status", "Confidence"
        ])

        query = db.query(Attendance, Student).join(Student, Attendance.student_id == Student.id)
        if target_date:
            query = query.filter(Attendance.attendance_date == target_date)
        if course:
            query = query.filter(Student.course == course)

        records = query.order_by(Attendance.attendance_date.desc(), Attendance.attendance_time.asc()).all()

        for att, stu in records:
            writer.writerow([
                stu.student_id,
                stu.roll_number,
                stu.name,
                att.attendance_date,
                att.attendance_time,
                att.status,
                f"{att.confidence}%"
            ])

        filename = f"attendance_report_{target_date}.csv"

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
