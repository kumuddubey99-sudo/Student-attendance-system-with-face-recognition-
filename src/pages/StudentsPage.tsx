import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ScanFace,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { Student } from '../types';
import { NavTab } from '../components/Sidebar';

interface StudentsPageProps {
  onNavigate: (tab: NavTab, params?: any) => void;
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  onNavigate,
  onShowNotification,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Edit modal state
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    year: '',
    division: '',
  });

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getStudents(searchQuery, courseFilter);
      setStudents(data);
    } catch (err: any) {
      onShowNotification('error', 'Failed to load students', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, courseFilter, onShowNotification]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      onShowNotification(
        'success',
        'Student Deleted',
        `Student "${studentToDelete.name}" and associated face embeddings removed.`
      );
      setStudentToDelete(null);
      loadStudents();
    } catch (err: any) {
      onShowNotification('error', 'Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (student: Student) => {
    setStudentToEdit(student);
    setEditFormData({
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      course: student.course,
      year: student.year,
      division: student.division,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;
    setIsEditing(true);
    try {
      await api.updateStudent(studentToEdit.id, editFormData);
      onShowNotification('success', 'Student Updated', `Updated details for ${editFormData.name}`);
      setStudentToEdit(null);
      loadStudents();
    } catch (err: any) {
      onShowNotification('error', 'Update Failed', err.message);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div id="students-page" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Student Directory</h2>
          <p className="text-xs text-neutral-500">
            {students.length} student{students.length === 1 ? '' : 's'} registered in SQLite database
          </p>
        </div>

        <button
          id="students-add-student-btn"
          onClick={() => onNavigate('add-student')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="student-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, roll no, or student ID..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              id="student-course-filter"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Courses</option>
              <option value="BSc IT">BSc IT</option>
              <option value="BSc CS">BSc CS</option>
              <option value="BCA">BCA</option>
              <option value="B.Tech IT">B.Tech IT</option>
            </select>
          </div>

          <button
            id="students-refresh-btn"
            onClick={loadStudents}
            className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors shrink-0"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-xs font-semibold text-neutral-700">No students found</p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
              {searchQuery || courseFilter
                ? 'Try adjusting your search filters.'
                : 'Click "Add New Student" to enroll your first student.'}
            </p>
            <button
              onClick={() => onNavigate('add-student')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Student ID</th>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">Course</th>
                  <th className="px-5 py-3.5">Year / Div</th>
                  <th className="px-5 py-3.5">Face Biometric</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {students.map((student) => {
                  const isFaceRegistered = student.face_status === 'Registered';

                  return (
                    <tr key={student.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-neutral-900 font-medium">
                        {student.student_id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-neutral-600">
                        {student.roll_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-neutral-900">{student.name}</div>
                        {student.email && (
                          <div className="text-[11px] text-neutral-400 truncate max-w-xs">
                            {student.email}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-neutral-700">
                        {student.course}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">
                        {student.year} - {student.division}
                      </td>
                      <td className="px-5 py-3.5">
                        {isFaceRegistered ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                            <XCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Not Registered</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Register Face Button */}
                          <button
                            id={`student-face-btn-${student.id}`}
                            onClick={() => onNavigate('register-face', { studentId: student.id })}
                            title={isFaceRegistered ? 'Update Face Registration' : 'Register Face'}
                            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                              isFaceRegistered
                                ? 'text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100'
                                : 'text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold px-2'
                            }`}
                          >
                            <ScanFace className="w-3.5 h-3.5" />
                            {!isFaceRegistered && <span>Register</span>}
                          </button>

                          {/* View Details */}
                          <button
                            id={`student-view-btn-${student.id}`}
                            onClick={() => onNavigate('student-details', { studentId: student.id })}
                            title="View Attendance Records"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            id={`student-edit-btn-${student.id}`}
                            onClick={() => handleOpenEdit(student)}
                            title="Edit Student Info"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            id={`student-delete-btn-${student.id}`}
                            onClick={() => setStudentToDelete(student)}
                            title="Delete Student"
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-neutral-200">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Delete Student?</h3>
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-neutral-900">{studentToDelete.name}</span> ({studentToDelete.roll_number})?
              All associated face biometric vectors and attendance records will be removed.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-student-btn"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {studentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="text-sm font-bold text-neutral-900">
                Edit Student Details: {studentToEdit.student_id}
              </h3>
              <button
                onClick={() => setStudentToEdit(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Course</label>
                  <select
                    value={editFormData.course}
                    onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="BSc IT">BSc IT</option>
                    <option value="BSc CS">BSc CS</option>
                    <option value="BCA">BCA</option>
                    <option value="B.Tech IT">B.Tech IT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Year</label>
                  <select
                    value={editFormData.year}
                    onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="FY">FY (First Year)</option>
                    <option value="SY">SY (Second Year)</option>
                    <option value="TY">TY (Third Year)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Division</label>
                  <input
                    type="text"
                    required
                    value={editFormData.division}
                    onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentToEdit(null)}
                  disabled={isEditing}
                  className="px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  {isEditing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
