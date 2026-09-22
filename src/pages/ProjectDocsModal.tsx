import React, { useState } from 'react';
import {
  BookOpen,
  X,
  GraduationCap,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Code,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ProjectDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'database' | 'ai_pipeline' | 'viva'>('overview');

  if (!isOpen) return null;

  return (
    <div
      id="project-docs-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">BSc IT Project Documentation</h3>
              <p className="text-xs text-neutral-400">
                AI Student Attendance System • Face Recognition Based Student Attendance
              </p>
            </div>
          </div>
          <button
            id="close-docs-modal-btn"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-neutral-200 bg-neutral-50 overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: '1. Project Overview' },
            { id: 'architecture', label: '2. System Architecture' },
            { id: 'database', label: '3. Database Schema' },
            { id: 'ai_pipeline', label: '4. AI & ArcFace Pipeline' },
            { id: 'viva', label: '5. Viva Questions & Answers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap font-medium ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-700 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 mb-1">Project Title</h4>
                <p className="font-semibold text-indigo-600">AI Student Attendance System</p>
                <p className="text-neutral-500">Subtitle: "Face Recognition Based Student Attendance"</p>
                <p className="text-[11px] text-neutral-500 mt-1">Academic Context: BSc Information Technology (BSc IT) Final Year Project</p>
                <p className="text-[11px] text-neutral-500">Developed by: 3 Students</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-900 mb-1">Problem Statement</h4>
                <p>
                  Traditional roll-call attendance in college classrooms consumes 10–15 minutes per lecture, is susceptible to proxy attendance, and requires laborious manual data entry into spreadsheets. This project implements an automated, privacy-compliant facial biometric attendance system using lightweight pretrained deep learning models.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-900 mb-1">Scope & Key Highlights</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-1">
                  <li>Real working end-to-end implementation with zero manual database insertions required.</li>
                  <li>Live browser camera integration with instant frame extraction.</li>
                  <li>Pretrained OpenCV YuNet face detection & SFace (ArcFace) 128-dimensional embedding generation.</li>
                  <li>Cosine similarity matching with configurable threshold (default 0.48).</li>
                  <li>Automatic single-session attendance logging (duplicate attendance prevented).</li>
                  <li>Daily and student-wise reports with instant CSV export.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-neutral-900">End-to-End System Architecture</h4>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 font-mono text-[11px] space-y-2">
                <div>[Client Browser / Webcam]</div>
                <div className="pl-4">↳ React 19 + Vite Frontend (Camera stream & Canvas frame snapshots)</div>
                <div className="pl-8">↳ Express Reverse Proxy (Port 3000)</div>
                <div className="pl-12">↳ Python FastAPI Backend (Port 8001)</div>
                <div className="pl-16">↳ OpenCV YuNet Face Detection (DNN)</div>
                <div className="pl-20">↳ OpenCV SFace (ArcFace 128-d Embedding Extraction)</div>
                <div className="pl-24">↳ Cosine Similarity against SQLite FaceEmbeddings</div>
                <div className="pl-28">↳ Attendance Table Insert / Update</div>
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 mb-1">Technology Justification</h5>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-1">
                  <li><strong>FastAPI:</strong> High-performance async Python web framework, ideal for handling NumPy matrix computations and OpenCV DNN models.</li>
                  <li><strong>OpenCV YuNet + SFace:</strong> Modern ONNX deep learning models distributed by OpenCV Zoo that execute in real-time (~30-50ms) on standard CPU hardware without demanding expensive GPUs.</li>
                  <li><strong>SQLite + SQLAlchemy:</strong> Lightweight, zero-config relational database that meets college project deployment constraints while maintaining strict foreign-key integrity.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-neutral-900">Relational Database Design (SQLite)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="font-bold text-indigo-600 mb-1">users Table</div>
                  <div>• id (INTEGER PRIMARY KEY)</div>
                  <div>• full_name (VARCHAR)</div>
                  <div>• username (VARCHAR UNIQUE)</div>
                  <div>• email (VARCHAR UNIQUE)</div>
                  <div>• hashed_password (VARCHAR)</div>
                  <div>• role (Teacher / Admin)</div>
                  <div>• created_at (DATETIME)</div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="font-bold text-indigo-600 mb-1">students Table</div>
                  <div>• id (INTEGER PRIMARY KEY)</div>
                  <div>• student_id (VARCHAR UNIQUE)</div>
                  <div>• roll_number (VARCHAR UNIQUE)</div>
                  <div>• name (VARCHAR)</div>
                  <div>• email (VARCHAR)</div>
                  <div>• phone (VARCHAR)</div>
                  <div>• course (VARCHAR)</div>
                  <div>• year (VARCHAR)</div>
                  <div>• division (VARCHAR)</div>
                  <div>• face_status (VARCHAR)</div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="font-bold text-indigo-600 mb-1">face_embeddings Table</div>
                  <div>• id (INTEGER PRIMARY KEY)</div>
                  <div>• student_id (FK → students.id)</div>
                  <div>• embedding (TEXT / JSON array of 128 floats)</div>
                  <div>• sample_count (INTEGER)</div>
                  <div>• model_name (VARCHAR "SFace-ArcFace")</div>
                  <div>• updated_at (DATETIME)</div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="font-bold text-indigo-600 mb-1">attendance Table</div>
                  <div>• id (INTEGER PRIMARY KEY)</div>
                  <div>• student_id (FK → students.id)</div>
                  <div>• attendance_date (VARCHAR YYYY-MM-DD)</div>
                  <div>• attendance_time (VARCHAR HH:MM:SS)</div>
                  <div>• status (VARCHAR "Present")</div>
                  <div>• confidence (FLOAT)</div>
                  <div>• created_at (DATETIME)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai_pipeline' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-neutral-900">AI Model Pipeline Details</h4>
              <p>
                The system employs a 2-stage deep neural network pipeline:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 pl-1">
                <li>
                  <strong className="text-neutral-900">YuNet Face Detector:</strong> An edge-oriented DNN that outputs the bounding box coordinates [x, y, w, h] and 5 facial keypoints (right eye, left eye, nose tip, right mouth corner, left mouth corner).
                </li>
                <li>
                  <strong className="text-neutral-900">Facial Alignment & Cropping:</strong> Using the 5 detected keypoints, the face is warped and aligned to canonical orientation to maximize feature invariance against head tilting.
                </li>
                <li>
                  <strong className="text-neutral-900">SFace (ArcFace) Feature Extraction:</strong> The aligned facial patch is passed through SFace to produce a 128-dimensional feature embedding vector with L2 normalization ($||v||_2 = 1$).
                </li>
                <li>
                  <strong className="text-neutral-900">Cosine Similarity Matching:</strong> During recognition, the query embedding $q$ is compared with registered student embeddings $s_i$ using dot product:
                  <div className="my-1.5 p-2 bg-neutral-100 rounded-lg font-mono text-[11px]">
                    Similarity = dot(q, s_i) / (||q|| * ||s_i||)
                  </div>
                  If the maximum similarity score is greater than or equal to the verification threshold (0.48), the student is authenticated; otherwise, the frame is marked as Unknown Face.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-3.5">
              <h4 className="text-sm font-bold text-neutral-900">Examiner Viva Questions & Recommended Answers</h4>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="font-semibold text-neutral-900">Q1: Why did you store embeddings instead of raw photos?</p>
                <p className="text-neutral-600 mt-1">
                  <strong>Answer:</strong> Storing raw photographs introduces massive database storage overhead and violates biometric privacy principles. Embeddings are one-way mathematical feature vectors (128 floats) that cannot be reverse-engineered into the original face photo, ensuring both lightweight storage and student privacy.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="font-semibold text-neutral-900">Q2: How does the system prevent duplicate attendance on the same day?</p>
                <p className="text-neutral-600 mt-1">
                  <strong>Answer:</strong> Before inserting a record into the `attendance` table, the backend queries whether a record already exists with matching `student_id` and `attendance_date`. If found, it returns `attendance_status: "already_marked"` without inserting a duplicate.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="font-semibold text-neutral-900">Q3: What happens if an unregistered person stands in front of the camera?</p>
                <p className="text-neutral-600 mt-1">
                  <strong>Answer:</strong> The system computes cosine similarity against all enrolled vectors. Because the maximum similarity will fall below the verification threshold (0.48), the system returns "Unknown Face" and explicitly does not record attendance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            BSc IT Capstone Project • AI Student Attendance System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
