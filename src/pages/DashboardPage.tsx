import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  UserPlus,
  Camera,
  RefreshCw,
  Clock,
  Calendar,
  ArrowUpRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: NavTab, params?: any) => void;
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onShowNotification,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadDashboard = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      onShowNotification('error', 'Dashboard Error', err.message || 'Could not fetch dashboard metrics.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onShowNotification]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-neutral-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-xs font-medium">Fetching real-time metrics from SQLite database...</p>
      </div>
    );
  }

  return (
    <div id="dashboard-page" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Welcome card */}
      <div className="bg-neutral-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold tracking-wider uppercase border border-indigo-500/30">
              Live Session
            </span>
            <span className="text-neutral-400 text-xs flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" />
              {data?.today_date}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            AI Face Recognition Attendance System
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Real-time biometric attendance verification powered by pretrained OpenCV ArcFace embeddings.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:shrink-0">
          <button
            id="dash-mark-attendance-button"
            onClick={() => onNavigate('mark-attendance')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>

          <button
            id="dash-add-student-button"
            onClick={() => onNavigate('add-student')}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-xl border border-neutral-700 transition-all"
          >
            <UserPlus className="w-4 h-4 text-neutral-300" />
            <span>Add Student</span>
          </button>

          <button
            id="dash-refresh-button"
            onClick={() => loadDashboard(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl border border-neutral-700 transition-all"
            title="Refresh Live Statistics"
            aria-label="Refresh stats"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Decorative subtle background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 4 Standard Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div id="stat-total-students" className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">
              {data?.total_students ?? 0}
            </span>
            <span className="text-xs text-neutral-400">enrolled</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center gap-1">
            <span>Stored in local SQLite database</span>
          </div>
        </div>

        {/* Present Today */}
        <div id="stat-present-today" className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Present Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono">
              {data?.present_today ?? 0}
            </span>
            <span className="text-xs text-neutral-400">students</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1">
            <span>Verified via AI face recognition</span>
          </div>
        </div>

        {/* Absent Today */}
        <div id="stat-absent-today" className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Absent Today</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 font-mono">
              {data?.absent_today ?? 0}
            </span>
            <span className="text-xs text-neutral-400">unmarked</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center gap-1">
            <span>Pending or absent for today</span>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div id="stat-attendance-percentage" className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Today's Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">
              {data?.attendance_percentage ?? 0}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, data?.attendance_percentage ?? 0))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Attendance Activity Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Recent Attendance Logs</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Latest attendance marks recorded directly into SQLite database
            </p>
          </div>
          <button
            id="dash-view-all-attendance-button"
            onClick={() => onNavigate('attendance')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!data?.recent_attendance || data.recent_attendance.length === 0) ? (
          <div className="p-12 text-center text-neutral-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
            <p className="text-xs font-medium text-neutral-600">No attendance marked yet today.</p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-sm mx-auto">
              Start by registering a student, training their face embedding, and launching Mark Attendance.
            </p>
            <button
              onClick={() => onNavigate('mark-attendance')}
              className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Launch Attendance Camera</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Roll Number</th>
                  <th className="px-5 py-3">Course / Div</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">AI Confidence</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {data.recent_attendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-neutral-900">
                      {rec.student_name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-neutral-600">
                      {rec.roll_number}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      {rec.course} • {rec.year}-{rec.division}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      {rec.attendance_date}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-neutral-600">
                      {rec.attendance_time}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 font-mono">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        {rec.confidence}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {rec.status}
                      </span>
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
