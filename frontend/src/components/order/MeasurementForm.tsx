import { Mic, MicOff, Loader2 } from 'lucide-react';
import type { Measurements } from '@/types/order.types';
import { ORDER_CONFIG } from '@/config/order.config';

export const measurementLabels: Record<keyof Measurements, string> = {
  height_cm: 'Height (cm)',
  weight_kg: 'Weight (kg)',
  chest_cm: 'Chest (cm)',
  waist_cm: 'Waist (cm)',
  hips_cm: 'Hips (cm)',
  shoulder_width_cm: 'Shoulder Width (cm)',
  arm_length_cm: 'Arm Length (cm)',
  inseam_cm: 'Inseam (cm)',
  neck_cm: 'Neck (cm)',
  back_length_cm: 'Back Length (cm)',
};

interface MeasurementFormProps {
  measurements: Measurements;
  setMeasure: (key: keyof Measurements, value: string) => void;
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  uploadingAudio: boolean;
  setAudioBlob: (b: Blob | null) => void;
  setAudioUrl: (u: string | null) => void;
  setAudioCloudUrl: (u: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
}

export function MeasurementForm({
  measurements,
  setMeasure,
  isRecording,
  audioBlob,
  audioUrl,
  uploadingAudio,
  setAudioBlob,
  setAudioUrl,
  setAudioCloudUrl,
  startRecording,
  stopRecording,
}: MeasurementFormProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">All fields are mandatory <span className="text-red-400">*</span></p>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(measurementLabels) as (keyof Measurements)[]).map((key) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {measurementLabels[key]} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={measurements[key]}
              onChange={(e) => setMeasure(key, e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
        ))}
      </div>

      {/* Audio recording option */}
      <div className="rounded-xl border border-gray-200 p-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Mic size={16} className="text-teal-600" />
          <p className="text-sm font-medium text-gray-700">Record Audio Note (optional)</p>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Prefer to speak your measurements or instructions? Record an audio note (max {ORDER_CONFIG.AUDIO_MAX_DURATION_SECONDS / 60} min) — we'll share it with the tailor.
        </p>
        <div className="flex items-center gap-3">
          {!isRecording && !audioBlob && (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Mic size={14} /> Start Recording
            </button>
          )}
          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium animate-pulse"
            >
              <MicOff size={14} /> Stop Recording
            </button>
          )}
          {audioUrl && !isRecording && (
            <div className="flex items-center gap-3 flex-1">
              <audio src={audioUrl} controls className="h-9 flex-1" />
              <button
                type="button"
                onClick={() => { setAudioBlob(null); setAudioUrl(null); setAudioCloudUrl(''); }}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {uploadingAudio && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading audio...</p>
        )}
      </div>
    </div>
  );
}
