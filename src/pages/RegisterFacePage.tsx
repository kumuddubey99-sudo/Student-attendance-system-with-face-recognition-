import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScanFace,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  User,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { Student } from '../types';
import { NavTab } from '../components/Sidebar';
import { WebcamCapture, captureFrameFromVideo } from '../components/WebcamCapture';

interface RegisterFacePageProps {
  initialStudentId?: number | null;
  onNavigate: (tab: NavTab, params?: any) => void;
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export const RegisterFacePage: React.FC<RegisterFacePageProps> = ({
  initialStudentId,
  onNavigate,
  onShowNotification,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(initialStudentId || null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedSamples, setCapturedSamples] = useState<string[]>([]);
  const [captureProgress, setCaptureProgress] = useState<number>(0);
  const [totalNeeded] = useState<number>(5);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Align student face inside the guide frame and press "Start Face Capture".'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch student list for selection
  useEffect(() => {
    api.getStudents()
      .then((data) => {
        setStudents(data);
        if (initialStudentId) {
          const match = data.find((s) => s.id === initialStudentId);
          if (match) {
            setSelectedStudentId(match.id);
            setSelectedStudent(match);
          }
        } else if (data.length > 0 && !selectedStudentId) {
          setSelectedStudentId(data[0].id);
          setSelectedStudent(data[0]);
        }
      })
      .catch((err) => {
        setErrorMessage('Failed to load students: ' + err.message);
      });
  }, [initialStudentId]);

  // Update selected student object when ID changes
  const handleStudentChange = (id: number) => {
    setSelectedStudentId(id);
    const match = students.find((s) => s.id === id);
    setSelectedStudent(match || null);
    setCapturedSamples([]);
    setCaptureProgress(0);
    setRegistrationSuccess(false);
    setErrorMessage(null);
    setStatusMessage('Align student face inside the guide frame and press "Start Face Capture".');
  };

  // Perform multi-sample capture from camera
  const handleStartCapture = async () => {
    if (!selectedStudentId) {
      setErrorMessage('Please select a student first.');
      return;
    }

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    if (!videoEl || videoEl.videoWidth === 0) {
      setErrorMessage('Webcam stream not ready. Please verify camera permissions.');
      return;
    }

    setIsCapturing(true);
    setErrorMessage(null);
    setCapturedSamples([]);
    setCaptureProgress(0);
    setRegistrationSuccess(false);

    const samples: string[] = [];

    // Capture 5 samples with 600ms delays
    for (let i = 1; i <= totalNeeded; i++) {
      setStatusMessage(`Capturing biometric sample ${i} of ${totalNeeded}... Keep face steady.`);
      setCaptureProgress(i);

      const frame = captureFrameFromVideo(videoEl);
      if (frame) {
        samples.push(frame);
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setIsCapturing(false);
    setCapturedSamples(samples);

    if (samples.length < 3) {
      setErrorMessage('Failed to capture sufficient valid camera frames. Please retry.');
      return;
    }

    // Submit to FastAPI backend
    setIsSubmitting(true);
    setStatusMessage('Generating 128-dimensional ArcFace embeddings with OpenCV DNN...');

    try {
      const res = await api.registerStudentFace(selectedStudentId, samples);
      setRegistrationSuccess(true);
      setStatusMessage(
        `Biometric registration complete! Saved 128-d ArcFace embedding from ${res.sample_count} sample(s).`
      );
      onShowNotification(
        'success',
        'Face Registered',
        `Biometrics successfully registered for ${selectedStudent?.name}.`
      );

      // Update student face status in local state
      setStudents((prev) =>
        prev.map((s) => (s.id === selectedStudentId ? { ...s, face_status: 'Registered' } : s))
      );
      if (selectedStudent) {
        setSelectedStudent({ ...selectedStudent, face_status: 'Registered' });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Face registration failed. Please ensure only one face is clearly visible.');
      setStatusMessage('Registration error. Please check lighting and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="register-face-page" className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Student Biometric Enrollment</h2>
        <p className="text-xs text-neutral-500">
          Capture facial video frames to compute and persist 128-dimensional deep feature embeddings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Webcam & Live Capture (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900 p-3 sm:p-4 rounded-2xl shadow-md border border-neutral-800">
            <WebcamCapture
              boxColor="indigo"
              overlayText={statusMessage}
              aspectRatio="video"
            />

            {/* Capture controls */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-neutral-400">
                {isCapturing ? (
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Capturing sample {captureProgress} / {totalNeeded}...
                  </span>
                ) : isSubmitting ? (
                  <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Computing ArcFace embeddings...
                  </span>
                ) : registrationSuccess ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Registration successful!
                  </span>
                ) : (
                  <span>Ready to capture facial samples</span>
                )}
              </div>

              <button
                id="start-face-capture-btn"
                onClick={handleStartCapture}
                disabled={isCapturing || isSubmitting || !selectedStudentId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
              >
                {isCapturing || isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>
                      {selectedStudent?.face_status === 'Registered'
                        ? 'Re-Capture 5 Face Samples'
                        : 'Start Face Capture (5 Samples)'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
            <span className="font-semibold text-neutral-800">Best Practices for Registration:</span>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-1 text-[11px]">
              <li>Look directly into the camera with neutral lighting.</li>
              <li>Only one person should be in the camera frame during registration.</li>
              <li>Remove dark sunglasses or masks that cover facial keypoints.</li>
              <li>The system captures 5 consecutive frames and averages the normalized feature vectors.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Student Selection & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Student Selector Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5" htmlFor="select-student-dropdown">
                Select Student for Biometric Registration
              </label>
              {students.length === 0 ? (
                <div className="p-3 bg-neutral-50 rounded-xl text-neutral-500 text-xs">
                  No students in database.
                  <button
                    onClick={() => onNavigate('add-student')}
                    className="block mt-2 text-indigo-600 font-semibold underline"
                  >
                    Add a student first
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="select-student-dropdown"
                    value={selectedStudentId ?? ''}
                    onChange={(e) => handleStudentChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-neutral-800"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.roll_number} • {s.student_id}) {s.face_status === 'Registered' ? '✓ Registered' : '⚠️ Not Reg'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Selected Student Profile Preview */}
            {selectedStudent && (
              <div className="p-4 bg-neutral-50/75 rounded-xl border border-neutral-200/60 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 text-sm">{selectedStudent.name}</span>
                  {selectedStudent.face_status === 'Registered' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Biometrics Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Pending Registration
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-1">
                  <div>
                    <span className="text-neutral-400">Roll Number:</span>{' '}
                    <span className="font-mono font-medium text-neutral-800">{selectedStudent.roll_number}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Student ID:</span>{' '}
                    <span className="font-mono font-medium text-neutral-800">{selectedStudent.student_id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Course:</span>{' '}
                    <span className="font-medium text-neutral-800">{selectedStudent.course}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Year / Div:</span>{' '}
                    <span className="font-medium text-neutral-800">{selectedStudent.year} - {selectedStudent.division}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status alerts */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {registrationSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Face Vector Successfully Stored</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      128-dimensional ArcFace embeddings generated and linked to student profile in SQLite.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    id="goto-mark-attendance-btn"
                    onClick={() => onNavigate('mark-attendance')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Test AI Attendance Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600">
              <span className="font-semibold text-neutral-800">Biometric Privacy Protection: </span>
              Photographs captured during registration are processed in memory and never written to disk. Only the mathematical vector is preserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
