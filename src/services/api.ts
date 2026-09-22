import {
  User,
  Student,
  AttendanceRecord,
  DashboardData,
  StudentDetailsResponse,
  RecognitionResult,
  SystemInfo
} from '../types';

const TOKEN_STORAGE_KEY = 'ai_attendance_token';
const USER_STORAGE_KEY = 'ai_attendance_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If not on login/register, clear auth
    if (!endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/register')) {
      clearAuth();
      window.dispatchEvent(new Event('auth_logout'));
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || data?.error || `Request failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(payload: {
    full_name: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    role: string;
  }) {
    return request<{ success: boolean; message: string; user_id: number }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { username_or_email: string; password: string }) {
    const res = await request<{ access_token: string; token_type: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.access_token);
    setStoredUser(res.user);
    return res;
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      clearAuth();
    }
  },

  async getCurrentUser() {
    return request<User>('/api/auth/me');
  },

  // Dashboard
  async getDashboard() {
    return request<DashboardData>('/api/dashboard');
  },

  // Students
  async getStudents(search?: string, course?: string) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (course) params.set('course', course);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Student[]>(`/api/students${query}`);
  },

  async getStudent(id: number) {
    return request<StudentDetailsResponse>(`/api/students/${id}`);
  },

  async createStudent(payload: {
    student_id: string;
    roll_number: string;
    name: string;
    email?: string;
    phone?: string;
    course: string;
    year: string;
    division: string;
  }) {
    return request<{ success: boolean; message: string; student: Student }>('/api/students', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStudent(id: number, payload: Partial<Student>) {
    return request<{ success: boolean; message: string; student: Student }>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteStudent(id: number) {
    return request<{ success: boolean; message: string }>(`/api/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Face
  async registerStudentFace(studentId: number, samples: string[]) {
    return request<{ success: boolean; message: string; face_status: string; sample_count: number }>(
      `/api/students/${studentId}/register-face`,
      {
        method: 'POST',
        body: JSON.stringify({ samples }),
      }
    );
  },

  async identifyFace(frame: string, threshold?: number) {
    return request<RecognitionResult>('/api/recognition/identify', {
      method: 'POST',
      body: JSON.stringify({ frame, threshold }),
    });
  },

  // Attendance
  async getAttendance(date?: string, search?: string, course?: string) {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (search) params.set('search', search);
    if (course) params.set('course', course);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<AttendanceRecord[]>(`/api/attendance${query}`);
  },

  async getTodayAttendance() {
    return request<AttendanceRecord[]>('/api/attendance/today');
  },

  async markAttendanceManual(studentId: number, status = 'Present') {
    return request<{ success: boolean; message: string; attendance: AttendanceRecord }>('/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, status }),
    });
  },

  // Reports
  async getReports(reportType: 'daily' | 'student_wise', date?: string, course?: string) {
    const params = new URLSearchParams({ report_type: reportType });
    if (date) params.set('date', date);
    if (course) params.set('course', course);
    return request<{ report_type: string; filter_date: string; total_records: number; data: any[] }>(
      `/api/reports?${params.toString()}`
    );
  },

  async getExportCsvUrl(reportType: 'daily' | 'student_wise', date?: string, course?: string) {
    const token = getStoredToken();
    const params = new URLSearchParams({ report_type: reportType });
    if (date) params.set('date', date);
    if (course) params.set('course', course);
    return `/api/reports/export-csv?${params.toString()}`;
  },

  // System
  async getSystemInfo() {
    return request<SystemInfo>('/api/system-info');
  },
};
