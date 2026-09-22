import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Mail,
  Calendar,
  GraduationCap,
  Cpu,
  Database,
  Lock,
  BookOpen,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { User as UserType, SystemInfo } from '../types';
import { NavTab } from '../components/Sidebar';

interface ProfilePageProps {
  currentUser: UserType | null;
  onNavigate: (tab: NavTab) => void;
  onShowDocs: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onNavigate,
  onShowDocs,
}) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    api.getSystemInfo().then(setSystemInfo).catch(console.error);
  }, []);

  return (
    <div id="profile-page" className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900">User Profile & System Architecture</h2>
        <p className="text-xs text-neutral-500">
          Account credentials, BSc IT project context, and OpenCV face recognition runtime status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Profile Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-indigo-500/20">
                {currentUser?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">{currentUser?.full_name}</h3>
                <p className="text-xs text-neutral-500 font-mono">@{currentUser?.username}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Shield className="w-3 h-3 text-indigo-500" />
                  {currentUser?.role}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  Email
                </span>
                <span className="font-medium text-neutral-800">{currentUser?.email}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Registered
                </span>
                <span className="font-mono text-neutral-700">{currentUser?.created_at?.split('T')[0]}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  Password Security
                </span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  bcrypt hashed
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="view-project-docs-btn"
                onClick={onShowDocs}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Full Project Documentation & Viva Notes</span>
              </button>
            </div>
          </div>

          {/* Academic Attribution Card */}
          <div className="bg-neutral-900 rounded-2xl p-5 text-white shadow-sm space-y-3 border border-neutral-800">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>BSc Information Technology Project</span>
            </div>
            <h4 className="text-sm font-bold tracking-tight">AI Student Attendance System</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Developed by 3 BSc IT final-year students as a standard, production-ready biometric verification prototype.
            </p>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Project Team:</span>
              <span className="text-white font-medium">3 IT Undergraduates</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI & System Architecture Info (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-neutral-900">AI & Deep Learning Configuration</h3>
                <p className="text-xs text-neutral-500">OpenCV DNN & ArcFace Feature Extraction</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Face Detection Model</span>
                <span className="font-semibold text-neutral-900 mt-1 block">OpenCV YuNet DNN</span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">5 facial landmarks & bounding boxes</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Embedding Extraction</span>
                <span className="font-semibold text-neutral-900 mt-1 block">SFace (ArcFace Architecture)</span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">128-dimensional L2-normalized vectors</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Similarity Metric</span>
                <span className="font-semibold text-neutral-900 mt-1 block">Cosine Similarity</span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">Threshold: {systemInfo?.recognition_threshold ?? 0.48}</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Database Engine</span>
                <span className="font-semibold text-neutral-900 mt-1 block">SQLite + SQLAlchemy ORM</span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">Foreign key cascades & indexes</span>
              </div>
            </div>

            {/* Privacy note */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 text-emerald-950 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Ethical Biometrics & Privacy Assurance
              </span>
              Raw student photographs are never written to disk or sent to external cloud APIs. Facial frames captured via webcam are immediately transformed into mathematical vectors and discarded from memory.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
