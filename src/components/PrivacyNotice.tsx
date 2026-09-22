import React from 'react';
import { ShieldCheck, X, Lock, Database, EyeOff, CheckCircle } from 'lucide-react';

interface PrivacyNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="privacy-notice-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200">
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Biometric Privacy Notice
              </h3>
              <p className="text-xs text-neutral-500">
                Academic Face Recognition Attendance Policy
              </p>
            </div>
          </div>
          <button
            id="close-privacy-notice-button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs text-neutral-600 leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
            <EyeOff className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-800">No Raw Photographs Stored: </span>
              The system extracts 128-dimensional numerical vectors (ArcFace/SFace embeddings) and immediately discards the raw facial images.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-800">Local Processing Only: </span>
              All facial detection, alignment, and vector comparisons are executed directly inside the institutional backend server. No biometric information is transmitted to third-party cloud APIs.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
            <Database className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-800">Institutional Consent & Academic Purpose: </span>
              This system is engineered as a standard BSc IT degree project for academic demonstration and student attendance logging under institution guidance.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Compliant with Academic Guidelines
          </span>
          <button
            id="acknowledge-privacy-button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
