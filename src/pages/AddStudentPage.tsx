import React, { useState } from 'react';
import { UserPlus, ArrowLeft, ArrowRight, ScanFace, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Student } from '../types';
import { NavTab } from '../components/Sidebar';

interface AddStudentPageProps {
  onNavigate: (tab: NavTab, params?: any) => void;
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export const AddStudentPage: React.FC<AddStudentPageProps> = ({
  onNavigate,
  onShowNotification,
}) => {
  const [studentId, setStudentId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('BSc IT');
  const [year, setYear] = useState('TY');
  const [division, setDivision] = useState('A');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentId.trim() || !rollNumber.trim() || !name.trim()) {
      setErrorMessage('Student ID, Roll Number, and Name are required.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.createStudent({
        student_id: studentId.trim(),
        roll_number: rollNumber.trim(),
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        course,
        year,
        division: division.trim().toUpperCase(),
      });

      setCreatedStudent(res.student);
      onShowNotification('success', 'Student Enrolled', `Student ${res.student.name} successfully created in SQLite.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add student. Please check for duplicate roll number or student ID.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="add-student-page" className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('students')}
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Student Directory</span>
      </button>

      {/* Success Banner if newly created */}
      {createdStudent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">Student Added Successfully!</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                <span className="font-semibold">{createdStudent.name}</span> ({createdStudent.student_id}) has been recorded in the database.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-neutral-900">Next Step: Register Face Biometrics</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Capture webcam facial samples to generate ArcFace embeddings for automated attendance.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('students')}
                className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Later
              </button>
              <button
                id="proceed-to-face-register-btn"
                onClick={() => onNavigate('register-face', { studentId: createdStudent.id })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <ScanFace className="w-4 h-4" />
                <span>Register Face Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Student Enrollment Form */
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-5 border-b border-neutral-100 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Student Enrollment Form</h2>
              <p className="text-xs text-neutral-500">
                Enter student academic details into the institutional database
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-neutral-700 mb-1" htmlFor="add-student-id">
                  Student ID / Registration No. <span className="text-rose-500">*</span>
                </label>
                <input
                  id="add-student-id"
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. IT-2024-001"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1" htmlFor="add-roll-number">
                  Class Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="add-roll-number"
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 101"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1" htmlFor="add-student-name">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="add-student-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-neutral-700 mb-1" htmlFor="add-course">
                  Course / Program <span className="text-rose-500">*</span>
                </label>
                <select
                  id="add-course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="BSc IT">BSc IT</option>
                  <option value="BSc CS">BSc CS</option>
                  <option value="BCA">BCA</option>
                  <option value="B.Tech IT">B.Tech IT</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1" htmlFor="add-year">
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  id="add-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="FY">FY (First Year)</option>
                  <option value="SY">SY (Second Year)</option>
                  <option value="TY">TY (Third Year)</option>
                  <option value="Final">Final Year</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1" htmlFor="add-division">
                  Division / Section <span className="text-rose-500">*</span>
                </label>
                <input
                  id="add-division"
                  type="text"
                  required
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="e.g. A"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-neutral-700 mb-1" htmlFor="add-email">
                  Student Email
                </label>
                <input
                  id="add-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.sharma@college.edu"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1" htmlFor="add-phone">
                  Phone Number
                </label>
                <input
                  id="add-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => onNavigate('students')}
                className="px-4 py-2.5 text-neutral-600 hover:bg-neutral-100 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-student-btn"
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Save Student</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
