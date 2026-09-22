import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  ScanFace,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Sliders,
  UserCheck,
  Clock,
  ShieldAlert,
  Play,
  Square
} from 'lucide-react';
import { api } from '../services/api';
import { RecognitionResult } from '../types';
import { NavTab } from '../components/Sidebar';
import { WebcamCapture, captureFrameFromVideo } from '../components/WebcamCapture';

interface MarkAttendancePageProps {
  onNavigate: (tab: NavTab, params?: any) => void;
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export const MarkAttendancePage: React.FC<MarkAttendancePageProps> = ({
  onNavigate,
  onShowNotification,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [threshold, setThreshold] = useState<number>(0.48);
  const [isProcessingFrame, setIsProcessingFrame] = useState<boolean>(false);

  // Recognition state
  const [latestResult, setLatestResult] = useState<RecognitionResult | null>(null);
  const [recognizedHistory, setRecognizedHistory] = useState<RecognitionResult[]>([]);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'warning' | 'error' | 'idle';
    title: string;
    description: string;
  }>({
    type: 'idle',
    title: 'Ready for Attendance',
    description: 'Position student in front of the camera. The AI will automatically verify their identity.',
  });

  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to capture single frame and send to recognition API
  const processCurrentFrame = useCallback(async () => {
    if (isProcessingFrame) return;

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    if (!videoEl || videoEl.videoWidth === 0) return;

    const frame = captureFrameFromVideo(videoEl);
    if (!frame) return;

    setIsProcessingFrame(true);

    try {
      const result = await api.identifyFace(frame, threshold);
      setLatestResult(result);

      if (result.success && result.status === 'recognized') {
        const isNewAttendance = result.attendance_status === 'marked';

        setStatusBanner({
          type: isNewAttendance ? 'success' : 'warning',
          title: isNewAttendance ? 'Attendance Marked!' : 'Already Marked Today',
          description: isNewAttendance
            ? `${result.name} (${result.roll_number}) • Present for today's session (${result.confidence}% confidence)`
            : `${result.name} (${result.roll_number}) • Already marked present at ${result.attendance_time}`,
        });

        // Add to local session history if not already listed
        setRecognizedHistory((prev) => {
          const exists = prev.some((p) => p.student_id === result.student_id);
          if (!exists) {
            return [result, ...prev.slice(0, 9)];
          }
          return prev;
        });
      } else if (result.status === 'unknown_face') {
        setStatusBanner({
          type: 'error',
          title: 'Unknown Face Detected',
          description: `Similarity score is below the verification threshold (${threshold}). Attendance not recorded.`,
        });
      } else if (result.status === 'multiple_faces') {
        setStatusBanner({
          type: 'warning',
          title: 'Multiple Faces Detected',
          description: 'Only one student should be visible in front of the camera at a time.',
        });
      } else if (result.status === 'no_face') {
        // Subtle idle update
        setStatusBanner({
          type: 'idle',
          title: 'Awaiting Student',
          description: 'Please face the camera directly to verify attendance.',
        });
      } else if (result.status === 'no_registered_faces') {
        setStatusBanner({
          type: 'warning',
          title: 'No Registered Faces in Database',
          description: 'Please register at least one student face first in the "Register Face" tab.',
        });
      }
    } catch (err: any) {
      console.error('[Recognition Loop Error]', err);
    } finally {
      setIsProcessingFrame(false);
    }
  }, [isProcessingFrame, threshold]);

  // Periodic recognition loop when scanning is enabled (every 1.2 seconds)
  useEffect(() => {
    if (isScanning) {
      scanIntervalRef.current = setInterval(() => {
        processCurrentFrame();
      }, 1200);
    } else {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    }

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isScanning, processCurrentFrame]);

  // Bounding box style for webcam
  const boxColor =
    latestResult?.status === 'recognized'
      ? 'green'
      : latestResult?.status === 'unknown_face'
      ? 'red'
      : 'indigo';

  const boxLabel =
    latestResult?.status === 'recognized'
      ? `${latestResult.name} (${latestResult.confidence}%)`
      : latestResult?.status === 'unknown_face'
      ? 'Unknown Student'
      : undefined;

  return (
    <div id="mark-attendance-page" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <span>Live Face Recognition Attendance</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Active
            </span>
          </h2>
          <p className="text-xs text-neutral-500">
            OpenCV YuNet Detection + ArcFace 128-d Feature Matching & SQLite Verification
          </p>
        </div>

        {/* Scan toggle button & threshold settings */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-scan-button"
            onClick={() => setIsScanning(!isScanning)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
              isScanning
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isScanning ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Pause Auto Scan</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Auto Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera & Recognition Bounding Box (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900 p-3 sm:p-4 rounded-2xl shadow-lg border border-neutral-800">
            <WebcamCapture
              box={latestResult?.status === 'recognized' || latestResult?.status === 'unknown_face' ? { x: 0, y: 0, w: 100, h: 100 } : null}
              boxColor={boxColor}
              boxLabel={boxLabel}
              overlayText={
                isProcessingFrame
                  ? 'Analyzing facial landmarks...'
                  : isScanning
                  ? 'Real-time AI recognition active'
                  : 'Scanning paused'
              }
              aspectRatio="video"
            />

            {/* Threshold & Sensitivity Control */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-400 w-full sm:w-auto">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>ArcFace Similarity Threshold:</span>
                <span className="font-mono text-white font-semibold">{threshold.toFixed(2)}</span>
                <span className="text-[10px] text-neutral-500">
                  (Standard: 0.48)
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-48">
                <input
                  id="threshold-slider"
                  type="range"
                  min="0.30"
                  max="0.75"
                  step="0.02"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Status Feedback Card */}
          <div
            id="recognition-status-card"
            className={`p-4 rounded-2xl border shadow-2xs transition-all ${
              statusBanner.type === 'success'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : statusBanner.type === 'warning'
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : statusBanner.type === 'error'
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-white border-neutral-200 text-neutral-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {statusBanner.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {statusBanner.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                {statusBanner.type === 'error' && <XCircle className="w-5 h-5 text-rose-600" />}
                {statusBanner.type === 'idle' && <ScanFace className="w-5 h-5 text-indigo-600" />}
              </div>
              <div>
                <h3 className="text-sm font-bold">{statusBanner.title}</h3>
                <p className="text-xs mt-0.5 leading-relaxed opacity-90">{statusBanner.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Verified Student Card & Session Log (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Latest Verified Student Profile */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Current Identification
              </h3>
              {latestResult?.status === 'recognized' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  {latestResult.confidence}% match
                </span>
              )}
            </div>

            {latestResult?.status === 'recognized' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {latestResult.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-900">{latestResult.name}</h4>
                    <p className="text-xs font-mono text-neutral-500">
                      Roll No: {latestResult.roll_number} • ID: {latestResult.student_uid}
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {latestResult.course} ({latestResult.year} - Div {latestResult.division})
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Session Date</span>
                    <span className="font-semibold text-neutral-800 font-mono">
                      {latestResult.attendance_date}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Marked Time</span>
                    <span className="font-semibold text-neutral-800 font-mono">
                      {latestResult.attendance_time}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Status</span>
                    <span className="font-semibold text-emerald-600">Present</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Attendance Action</span>
                    <span className="font-semibold text-neutral-700">
                      {latestResult.attendance_status === 'marked' ? 'Newly Recorded' : 'Already Marked'}
                    </span>
                  </div>
                </div>
              </div>
            ) : latestResult?.status === 'unknown_face' ? (
              <div className="p-6 text-center text-neutral-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-neutral-800">Unrecognized Face</h4>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  No registered student in the database matches this face above the cosine similarity threshold ({threshold}).
                </p>
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-400 space-y-2">
                <ScanFace className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-xs text-neutral-500">
                  Waiting for face recognition match...
                </p>
              </div>
            )}
          </div>

          {/* Session Verified Students List */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Recognized This Session ({recognizedHistory.length})
              </h3>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View Full Log
              </button>
            </div>

            {recognizedHistory.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-4">
                No students recognized in this live session yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {recognizedHistory.map((item, idx) => (
                  <div
                    key={`${item.student_id}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        {item.roll_number} • {item.attendance_time}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
