import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface WebcamCaptureProps {
  onCaptureFrame?: (base64Frame: string) => void;
  isStreaming?: boolean;
  box?: BoundingBox | null;
  boxColor?: 'green' | 'red' | 'indigo' | 'amber';
  boxLabel?: string;
  overlayText?: string;
  aspectRatio?: 'video' | 'square';
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  box,
  boxColor = 'indigo',
  boxLabel,
  overlayText,
  aspectRatio = 'video',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('[Webcam Error]', err);
      setIsLoading(false);
      setHasPermission(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Camera permission was denied. Please allow camera access in your browser address bar settings to use face recognition.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device detected on your system. Please connect a webcam.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage('Camera is currently in use by another application. Please close other camera tabs/apps.');
      } else {
        setErrorMessage(`Camera unavailable: ${err.message || 'Unable to access media stream'}`);
      }
    }
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  return (
    <div id="webcam-container" className="relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-inner">
      <div className={`relative w-full ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-4/3 sm:aspect-16/10'} flex items-center justify-center`}>
        {/* Actual Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transform -scale-x-100 ${
            hasPermission ? 'block' : 'hidden'
          }`}
        />

        {/* Hidden Canvas used by parent components to snapshot frames */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 text-neutral-400 gap-3 p-4 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-medium">Initializing camera stream...</p>
          </div>
        )}

        {/* Permission Denied / Camera Error */}
        {!isLoading && !hasPermission && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 text-neutral-300 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <CameraOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Camera Unavailable</h4>
            <p className="text-xs text-neutral-400 max-w-sm mb-4 leading-relaxed">
              {errorMessage || 'Camera access is required for AI face recognition.'}
            </p>
            <button
              id="retry-camera-button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Camera Access
            </button>
          </div>
        )}

        {/* Visual Face Guide Overlay (Oval / Crosshair) */}
        {hasPermission && !box && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-64 sm:w-56 sm:h-72 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 border-t-2 border-l-2 border-white/60 absolute top-4 left-4" />
              <div className="w-3 h-3 border-t-2 border-r-2 border-white/60 absolute top-4 right-4" />
              <div className="w-3 h-3 border-b-2 border-l-2 border-white/60 absolute bottom-4 left-4" />
              <div className="w-3 h-3 border-b-2 border-r-2 border-white/60 absolute bottom-4 right-4" />
            </div>
          </div>
        )}

        {/* Dynamic Bounding Box Overlay if face recognized */}
        {hasPermission && box && (
          <div
            className={`absolute pointer-events-none rounded-lg border-2 transition-all duration-100 ${
              boxColor === 'green'
                ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : boxColor === 'red'
                ? 'border-rose-400 bg-rose-500/10 shadow-[0_0_15px_rgba(251,113,133,0.3)]'
                : 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_15px_rgba(129,140,248,0.3)]'
            }`}
            style={{
              // Note: video is flipped horizontally (-scale-x-100)
              // We adjust box position relative to video dimensions
              left: '20%',
              top: '15%',
              width: '60%',
              height: '65%',
            }}
          >
            {boxLabel && (
              <div
                className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[11px] font-semibold text-white truncate max-w-full ${
                  boxColor === 'green'
                    ? 'bg-emerald-600'
                    : boxColor === 'red'
                    ? 'bg-rose-600'
                    : 'bg-indigo-600'
                }`}
              >
                {boxLabel}
              </div>
            )}
          </div>
        )}

        {/* Subtitle / Overlay Text */}
        {hasPermission && overlayText && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex justify-center">
            <div className="px-3.5 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-xs border border-white/10 text-white text-xs font-medium text-center shadow-md">
              {overlayText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export helper to grab current frame as base64 from a video element
export function captureFrameFromVideo(videoElement: HTMLVideoElement): string | null {
  if (!videoElement || videoElement.videoWidth === 0) return null;
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}
