import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ScanFace,
  User,
  Calendar,
  Clock,
  Percent,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import { StudentDetailsResponse } from '../types';
import { NavTab } from '../components/Sidebar';

interface StudentDetailsPageProps {
  studentId: number | null;
  onNavigate: (tab: NavTab, params?: any) => void;
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export const StudentDetailsPage: React.FC<StudentDetailsPageProps> = ({
  studentId,
  onNavigate,
  onShowNotification,
}) => {
  const [data, setData] = useState<StudentDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDetails = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      const res = await api.getStudent(studentId);
      setData(res);
    } catch (err: any) {
      onShowNotification('error', 'Student Not Found', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, onShowNotification]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (!studentId) {
    return (
      <div className="p-8 text-center text-neutral-500">
        <p>No student selected.</p>
        <button
          onClick={() => onNavigate('students')}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium"
        >
          Go to Student Directory
        </button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
        <p className="text-xs">Loading student records and metrics...</p>
      </div>
    );
  }

  const { student, metrics, history } = data;
  const isRegistered = student.face_status === 'Registered';

  return (
    <div id="student-details-page" className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('students')}
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Student Directory</span>
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700 shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-neutral-900">{student.name}</h2>
              {isRegistered ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Face Registered
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <XCircle className="w-3 h-3" />
                  Face Not Registered
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-neutral-500">
              <span className="font-mono font-medium text-neutral-700">ID: {student.student_id}</span>
              <span>•</span>
              <span className="font-mono font-medium text-neutral-700">Roll No: {student.roll_number}</span>
              <span>•</span>
              <span>{student.course} ({student.year} - Div {student.division})</span>
            </div>

            {(student.email || student.phone) && (
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-400">
                {student.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {student.email}
                  </span>
                )}
                {student.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {student.phone}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action: Register Face */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            id="detail-register-face-btn"
            onClick={() => onNavigate('register-face', { studentId: student.id })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <ScanFace className="w-4 h-4" />
            <span>{isRegistered ? 'Update Face Registration' : 'Register Face Biometrics'}</span>
          </button>
        </div>
      </div>

      {/* 4 Attendance Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500">Total Recorded Days</span>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2">
            {metrics.total_classes}
          </div>
          <span className="text-[11px] text-neutral-400">sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500">Days Present</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-2">
            {metrics.present}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">attended</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500">Days Absent</span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-2">
            {metrics.absent}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">unattended</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500">Attendance Percentage</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-2">
            {metrics.percentage}%
          </div>
          <div className="mt-2 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, metrics.percentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">Attendance History</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Full historical logs for {student.name}
          </p>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
            <p className="text-xs font-medium">No attendance records found for this student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">AI Confidence</th>
                  <th className="px-5 py-3.5">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-neutral-900">
                      {record.attendance_date}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-neutral-600">
                      {record.attendance_time}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-mono text-neutral-700">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        {record.confidence}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      Face Recognition (OpenCV ArcFace)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
