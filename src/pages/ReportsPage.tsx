import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Percent,
  CheckCircle2,
  Users,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { StudentWiseReportItem, DailyReportItem } from '../types';
import { NavTab } from '../components/Sidebar';

interface ReportsPageProps {
  onNavigate: (tab: NavTab, params?: any) => void;
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  onNavigate,
  onShowNotification,
}) => {
  const [reportType, setReportType] = useState<'daily' | 'student_wise'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [dailyData, setDailyData] = useState<DailyReportItem[]>([]);
  const [studentWiseData, setStudentWiseData] = useState<StudentWiseReportItem[]>([]);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getReports(reportType, selectedDate, courseFilter || undefined);
      if (reportType === 'daily') {
        setDailyData(res.data);
      } else {
        setStudentWiseData(res.data);
      }
    } catch (err: any) {
      onShowNotification('error', 'Report Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [reportType, selectedDate, courseFilter, onShowNotification]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleDownloadCsv = async () => {
    try {
      const url = await api.getExportCsvUrl(reportType, selectedDate, courseFilter || undefined);
      window.open(url, '_blank');
      onShowNotification(
        'success',
        'CSV Exported',
        `Downloaded ${reportType === 'daily' ? 'Daily Attendance' : 'Student-wise'} CSV report.`
      );
    } catch (err: any) {
      onShowNotification('error', 'Export Failed', err.message);
    }
  };

  return (
    <div id="reports-page" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Attendance Reports & Analytics</h2>
          <p className="text-xs text-neutral-500">
            Generate institutional reports and export official CSV records for academic records
          </p>
        </div>

        <button
          id="export-report-csv-btn"
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export {reportType === 'daily' ? 'Daily' : 'Student'} CSV</span>
        </button>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          id="tab-report-daily"
          onClick={() => setReportType('daily')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            reportType === 'daily'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Attendance Report</span>
        </button>

        <button
          id="tab-report-student-wise"
          onClick={() => setReportType('student_wise')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            reportType === 'student_wise'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student-Wise Summary Report</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {reportType === 'daily' && (
            <div className="w-full sm:w-48">
              <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                Report Date
              </label>
              <input
                id="report-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          <div className="w-full sm:w-48">
            <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
              Course Filter
            </label>
            <select
              id="report-course-select"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Academic Programs</option>
              <option value="BSc IT">BSc IT</option>
              <option value="BSc CS">BSc CS</option>
              <option value="BCA">BCA</option>
              <option value="B.Tech IT">B.Tech IT</option>
            </select>
          </div>
        </div>

        <button
          id="report-refresh-btn"
          onClick={loadReport}
          className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors self-end sm:self-auto"
          title="Reload Report Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs">Computing attendance report statistics...</p>
          </div>
        ) : reportType === 'daily' ? (
          /* Daily Report Table */
          dailyData.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
              <p className="text-xs font-semibold text-neutral-700">No attendance marked on this date</p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Select another date or run live attendance recognition.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Student ID</th>
                    <th className="px-5 py-3.5">Roll Number</th>
                    <th className="px-5 py-3.5">Student Name</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Time</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">AI Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {dailyData.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-neutral-900 font-medium">
                        {item.student_uid}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-neutral-600">
                        {item.roll_number}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">
                        {item.student_name}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-neutral-700">
                        {item.attendance_date}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-neutral-600">
                        {item.attendance_time}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 font-mono text-neutral-700 bg-neutral-50 px-2 py-0.5 rounded-full border border-neutral-200/50">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          {item.confidence}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Student-Wise Summary Table */
          studentWiseData.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
              <p className="text-xs font-semibold text-neutral-700">No students found</p>
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
                    <th className="px-5 py-3.5 text-center">Total Sessions</th>
                    <th className="px-5 py-3.5 text-center">Present</th>
                    <th className="px-5 py-3.5 text-center">Absent</th>
                    <th className="px-5 py-3.5 text-right">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {studentWiseData.map((item) => {
                    const isGoodStanding = item.attendance_percentage >= 75;
                    return (
                      <tr key={item.student_id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-neutral-900 font-medium">
                          {item.student_uid}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-neutral-600">
                          {item.roll_number}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-neutral-900">
                          {item.name}
                        </td>
                        <td className="px-5 py-3.5 text-neutral-600">
                          {item.course} • {item.year}-{item.division}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono font-medium">
                          {item.total_days}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono text-emerald-600 font-semibold">
                          {item.present_days}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono text-rose-600">
                          {item.absent_days}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                              isGoodStanding
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            }`}
                          >
                            {item.attendance_percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};
