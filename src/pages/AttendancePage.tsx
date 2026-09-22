import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  Sparkles,
  Download,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { AttendanceRecord } from '../types';
import { NavTab } from '../components/Sidebar';

interface AttendancePageProps {
  onNavigate: (tab: NavTab, params?: any) => void;
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  onNavigate,
  onShowNotification,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'today'>('today');

  const todayStr = new Date().toISOString().split('T')[0];

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'today') {
        const data = await api.getTodayAttendance();
        setRecords(data);
      } else {
        const data = await api.getAttendance(selectedDate || undefined, searchQuery || undefined, courseFilter || undefined);
        setRecords(data);
      }
    } catch (err: any) {
      onShowNotification('error', 'Attendance Log Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedDate, searchQuery, courseFilter, onShowNotification]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Export current attendance directly
  const handleExportCsv = async () => {
    try {
      const dateToUse = activeTab === 'today' ? todayStr : selectedDate;
      const url = await api.getExportCsvUrl('daily', dateToUse || undefined, courseFilter || undefined);
      window.open(url, '_blank');
      onShowNotification('success', 'Exporting CSV', 'Downloading attendance log in CSV format...');
    } catch (err: any) {
      onShowNotification('error', 'Export Failed', err.message);
    }
  };

  return (
    <div id="attendance-page" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Verified Attendance Records</h2>
          <p className="text-xs text-neutral-500">
            Biometrically verified student presence stored directly in SQLite database
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="attendance-export-csv-btn"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs: Today's Attendance vs All History */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          id="tab-today-attendance"
          onClick={() => {
            setActiveTab('today');
            setSelectedDate('');
          }}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'today'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Today's Attendance</span>
        </button>

        <button
          id="tab-all-attendance"
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Attendance History & Filters</span>
        </button>
      </div>

      {/* Filter Bar (Active on All tab, or optional refinement) */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              id="attendance-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, roll no, ID..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Date Picker (visible on History tab) */}
          {activeTab === 'all' && (
            <div className="relative w-full sm:w-44">
              <input
                id="attendance-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-neutral-700"
              />
            </div>
          )}

          {/* Course Filter */}
          <div className="w-full sm:w-40">
            <select
              id="attendance-course-filter"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Courses</option>
              <option value="BSc IT">BSc IT</option>
              <option value="BSc CS">BSc CS</option>
              <option value="BCA">BCA</option>
              <option value="B.Tech IT">B.Tech IT</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            id="attendance-refresh-btn"
            onClick={loadAttendance}
            className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors"
            title="Refresh Attendance"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs">Loading attendance records from database...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-xs font-semibold text-neutral-700">No attendance records found</p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
              {activeTab === 'today'
                ? 'No students have been recognized today yet. Go to Mark Attendance to start verifying.'
                : 'No records match the selected date or search filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Student ID</th>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Course / Div</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">AI Confidence</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-neutral-900 font-medium">
                      {rec.student_uid}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-neutral-600">
                      {rec.roll_number}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-neutral-900">
                      {rec.student_name}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      {rec.course} • {rec.year}-{rec.division}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-neutral-700">
                      {rec.attendance_date}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-neutral-600">
                      {rec.attendance_time}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-mono text-neutral-700 bg-neutral-50 px-2 py-0.5 rounded-full border border-neutral-200/50">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        {rec.confidence}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
