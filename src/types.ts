export type Role = 'Admin' | 'Teacher';

export interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Student {
  id: number;
  student_id: string;
  roll_number: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  course: string;
  year: string;
  division: string;
  face_status: 'Registered' | 'Not Registered';
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  student_uid: string;
  course: string;
  year: string;
  division: string;
  attendance_date: string;
  attendance_time: string;
  status: string;
  confidence: number;
  created_at: string;
}

export interface DashboardData {
  total_students: number;
  present_today: number;
  absent_today: number;
  attendance_percentage: number;
  today_date: string;
  current_time: string;
  recent_attendance: AttendanceRecord[];
}

export interface StudentAttendanceMetrics {
  total_classes: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface StudentDetailsResponse {
  student: Student;
  metrics: StudentAttendanceMetrics;
  history: {
    id: number;
    attendance_date: string;
    attendance_time: string;
    status: string;
    confidence: number;
    created_at: string;
  }[];
}

export interface RecognitionResult {
  success: boolean;
  status: 'recognized' | 'unknown_face' | 'no_face' | 'multiple_faces' | 'no_registered_faces' | 'error';
  message: string;
  student_id?: number;
  student_uid?: string;
  name?: string;
  roll_number?: string;
  course?: string;
  year?: string;
  division?: string;
  confidence?: number;
  similarity?: number;
  threshold?: number;
  attendance_status?: 'marked' | 'already_marked';
  attendance_message?: string;
  attendance_time?: string;
  attendance_date?: string;
  box?: {
    x: number;
    y: number;
    w: number;
    h: number;
  } | null;
}

export interface StudentWiseReportItem {
  student_id: number;
  student_uid: string;
  roll_number: string;
  name: string;
  course: string;
  year: string;
  division: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
}

export interface DailyReportItem {
  id: number;
  student_id: number;
  student_uid: string;
  roll_number: string;
  student_name: string;
  course: string;
  year: string;
  division: string;
  attendance_date: string;
  attendance_time: string;
  status: string;
  confidence: number;
}

export interface SystemInfo {
  project_name: string;
  subtitle: string;
  academic_context: string;
  developers: string[];
  tech_stack: {
    frontend: string;
    backend: string;
    database: string;
    ai_models: string;
  };
  recognition_threshold: number;
  privacy_notice: string;
}
