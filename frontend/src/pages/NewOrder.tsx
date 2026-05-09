import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ruler,
  Shirt,
  AlertTriangle,
  Check,
  Package,
  MapPin,
  IndianRupee,
  Info,
  MessageSquare,
  LocateFixed,
  Mic,
  MicOff,
  Truck,
  PackageOpen,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import { templateService, type Template } from '@/services/templates';
import { lookupPincode } from '@/services/pincode';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/cn';
import api from '@/services/api';
import { ORDER_CONFIG } from '@/config/order.config';

type Step = 'template' | 'details' | 'review' | 'confirmed';

const STEPS: { key: Step; label: string }[] = [
  { key: 'template', label: 'Choose Template' },
  { key: 'details', label: 'Measurements & Details' },
  { key: 'review', label: 'Review & Pay' },
  { key: 'confirmed', label: 'Order Confirmed' },
];

type MeasurementMethod = 'manual_measurements' | 'reference_clothing';
type DeliveryMethod = 'pickup' | 'self_parcel';

interface Measurements {
  height_cm: string;
  weight_kg: string;
  chest_cm: string;
  waist_cm: string;
  hips_cm: string;
  shoulder_width_cm: string;
  arm_length_cm: string;
  inseam_cm: string;
  neck_cm: string;
  back_length_cm: string;
}

const emptyMeasurements: Measurements = {
  height_cm: '',
  weight_kg: '',
  chest_cm: '',
  waist_cm: '',
  hips_cm: '',
  shoulder_width_cm: '',
  arm_length_cm: '',
  inseam_cm: '',
  neck_cm: '',
  back_length_cm: '',
};

const measurementLabels: Record<keyof Measurements, string> = {
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

interface Address {
  flat_number: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function NewOrder() {
  const navigate = useNavigate();
  const geo = useGeolocation();

  const [step, setStep] = useState<Step>('template');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Selections
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [measurementMethod, setMeasurementMethod] = useState<MeasurementMethod>('manual_measurements');
  const [measurements, setMeasurements] = useState<Measurements>(emptyMeasurements);
  const [referenceConfirmed, setReferenceConfirmed] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  // Audio recording for measurements
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioCloudUrl, setAudioCloudUrl] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Audio recording for special instructions
  const [siIsRecording, setSiIsRecording] = useState(false);
  const [siAudioBlob, setSiAudioBlob] = useState<Blob | null>(null);
  const [siAudioUrl, setSiAudioUrl] = useState<string | null>(null);
  const [siUploadingAudio, setSiUploadingAudio] = useState(false);
  const [siAudioCloudUrl, setSiAudioCloudUrl] = useState('');
  const siMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const siAudioChunksRef = useRef<Blob[]>([]);

  // Address + contact
  const [address, setAddress] = useState<Address>({ flat_number: '', address_line1: '', city: '', state: '', postal_code: '' });
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDistrict, setPincodeDistrict] = useState('');
  const [reverseGeoLoading, setReverseGeoLoading] = useState(false);

  // Delivery method
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('self_parcel');

  // Payment
  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);

  useEffect(() => {
    templateService
      .getAll()
      .then((res) => setTemplates(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Pre-fill contact and default address from user profile
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.phone_number) setContactPhone(u.phone_number);
      if (u.email) setContactEmail(u.email);
      // Fetch default address from profile
      if (u.user_id) {
        api.get(`/user/details/${u.user_id}`).then((res) => {
          const cp = res.data?.data?.consumer_profile || res.data?.consumer_profile;
          if (cp) {
            setAddress((a) => ({
              ...a,
              address_line1: cp.address_line1 || a.address_line1,
              flat_number: cp.address_line2 || a.flat_number,
              city: cp.city || a.city,
              state: cp.state || a.state,
              postal_code: cp.postal_code || a.postal_code,
            }));
          }
        }).catch(() => {});
      }
    } catch { /* ignore */ }
  }, []);

  // Pincode auto-lookup
  const handlePincodeLookup = useCallback(async (pincode: string) => {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) { setPincodeDistrict(''); return; }
    setPincodeLoading(true);
    const result = await lookupPincode(pincode);
    setPincodeLoading(false);
    if (result) {
      setAddress((a) => ({ ...a, city: result.city, state: result.state }));
      setPincodeDistrict(result.district);
    } else {
      setPincodeDistrict('');
    }
  }, []);

  useEffect(() => {
    const pin = address.postal_code;
    if (pin.length === 6) {
      const t = setTimeout(() => handlePincodeLookup(pin), 300);
      return () => clearTimeout(t);
    } else { setPincodeDistrict(''); }
  }, [address.postal_code, handlePincodeLookup]);

  // Reverse geocode from lat/lng
  const reverseGeocode = useCallback(async () => {
    if (!geo.location) return;
    setReverseGeoLoading(true);
    try {
      const { latitude, longitude } = geo.location;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const data = await res.json();
      const a = data.address || {};
      setAddress((prev) => ({
        ...prev,
        address_line1: [a.road, a.neighbourhood, a.suburb].filter(Boolean).join(', ') || '',
        city: a.city || a.town || a.village || a.county || '',
        state: a.state || '',
        postal_code: a.postcode || '',
      }));
      if (a.postcode) setPincodeDistrict(a.state_district || a.county || '');
    } catch { /* silent */ }
    setReverseGeoLoading(false);
  }, [geo.location]);

  // Auto-fill address when location is granted
  useEffect(() => {
    if (geo.status === 'granted' && geo.location && !address.address_line1) {
      reverseGeocode();
    }
  }, [geo.status, geo.location, reverseGeocode, address.address_line1]);

  // ─── Audio Recording ──────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ORDER_CONFIG.AUDIO_MIME_TYPES.find((m) => MediaRecorder.isTypeSupported(m)) || 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      // Auto-stop after max duration
      setTimeout(() => { if (mediaRecorderRef.current?.state === 'recording') stopRecording(); }, ORDER_CONFIG.AUDIO_MAX_DURATION_SECONDS * 1000);
    } catch { /* permission denied or unavailable */ }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadAudioToCloudinary = async (): Promise<string> => {
    if (audioCloudUrl) return audioCloudUrl;
    if (!audioBlob) return '';
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'measurement_audio.webm');
      const res = await api.post('/uploads/audio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.data?.url || '';
      setAudioCloudUrl(url);
      setUploadingAudio(false);
      return url;
    } catch {
      setUploadingAudio(false);
      return '';
    }
  };

  // ─── Special Instructions Audio Recording ───────────────
  const startSiRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ORDER_CONFIG.AUDIO_MIME_TYPES.find((m) => MediaRecorder.isTypeSupported(m)) || 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      siAudioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) siAudioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(siAudioChunksRef.current, { type: mimeType });
        setSiAudioBlob(blob);
        setSiAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      siMediaRecorderRef.current = recorder;
      setSiIsRecording(true);
      setTimeout(() => { if (siMediaRecorderRef.current?.state === 'recording') stopSiRecording(); }, ORDER_CONFIG.AUDIO_MAX_DURATION_SECONDS * 1000);
    } catch { /* permission denied or unavailable */ }
  };

  const stopSiRecording = () => {
    siMediaRecorderRef.current?.stop();
    setSiIsRecording(false);
  };

  const uploadSiAudioToCloudinary = async (): Promise<string> => {
    if (siAudioCloudUrl) return siAudioCloudUrl;
    if (!siAudioBlob) return '';
    setSiUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', siAudioBlob, 'special_instructions_audio.webm');
      const res = await api.post('/uploads/audio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.data?.url || '';
      setSiAudioCloudUrl(url);
      setSiUploadingAudio(false);
      return url;
    } catch {
      setSiUploadingAudio(false);
      return '';
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const templatePrice = selectedTemplate?.template_type.base_price ?? 0;
  const pickupFee = deliveryMethod === 'pickup' ? ORDER_CONFIG.PICKUP_FEE : 0;
  const totalAmount = Number(templatePrice) + pickupFee;

  const measurementDone = (): boolean => {
    if (measurementMethod === 'reference_clothing') return referenceConfirmed;
    // All fields mandatory
    return (Object.keys(emptyMeasurements) as (keyof Measurements)[]).every((k) => measurements[k].trim() !== '');
  };

  const addressDone = (): boolean =>
    address.flat_number.trim() !== '' &&
    address.address_line1.trim() !== '' &&
    address.city.trim() !== '' &&
    address.state.trim() !== '' &&
    /^[1-9][0-9]{5}$/.test(address.postal_code) &&
    /^[6-9]\d{9}$/.test(contactPhone) &&
    contactEmail.includes('@');

  const canNext = (): boolean => {
    if (step === 'template') return !!selectedTemplate;
    if (step === 'details') return measurementDone() && addressDone();
    return true;
  };

  const goNext = () => { if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].key); };
  const goBack = () => { if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key); };

  const setAddr = (key: keyof Address, value: string) => setAddress((a) => ({ ...a, [key]: value }));
  const setMeasure = (key: keyof Measurements, value: string) =>
    setMeasurements((prev) => ({ ...prev, [key]: value.replace(/[^\d.]/g, '') }));

  // ─── Load Razorpay script ──────────────────────────────────
  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  // ─── Place Order + Pay ─────────────────────────────────────
  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPayError('');

    try {
      // Upload measurement audio if present
      let audioFileUrl = audioCloudUrl;
      if (audioBlob && !audioCloudUrl) {
        audioFileUrl = await uploadAudioToCloudinary();
      }

      // Upload special instructions audio if present
      let siAudioFileUrl = siAudioCloudUrl;
      if (siAudioBlob && !siAudioCloudUrl) {
        siAudioFileUrl = await uploadSiAudioToCloudinary();
      }

      // 1. Create Razorpay order on backend
      const { data: rzData } = await api.post('/payments/create-order', {
        template_type_id: selectedTemplate!.template_type.id,
        amount: totalAmount,
      });
      const { razorpay_order_id, amount, currency, key_id } = rzData.data;

      // 2. Load Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) { setPayError('Failed to load payment gateway. Please try again.'); setPlacing(false); return; }

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // 3. Open Razorpay checkout
      const options = {
        key: key_id,
        amount,
        currency,
        name: 'StitchUp',
        description: `Order — ${selectedTemplate!.template_type.type_name}`,
        order_id: razorpay_order_id,
        prefill: { name: `${user.first_name || ''} ${user.last_name || ''}`.trim(), email: contactEmail, contact: contactPhone },
        theme: { color: '#0d9488' },
        handler: async (response: any) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              template_type_id: selectedTemplate!.template_type.id,
              measurement_method: measurementMethod,
              measurements: measurementMethod === 'manual_measurements' ? measurements : undefined,
              measurement_audio_url: audioFileUrl || undefined,
              special_instructions: specialRequests || undefined,
              special_instructions_audio_url: siAudioFileUrl || undefined,
              delivery_flat_number: address.flat_number,
              delivery_address_line1: address.address_line1,
              delivery_city: address.city,
              delivery_state: address.state,
              delivery_postal_code: address.postal_code,
              contact_phone: contactPhone,
              contact_email: contactEmail,
              delivery_method: deliveryMethod,
              pickup_fee: pickupFee,
            });
            const orderId = verifyRes.data?.data?.order_id || verifyRes.data?.order_id;
            setConfirmedOrderId(orderId || null);
            setStep('confirmed');
          } catch {
            setPayError('Payment verified but order creation failed. Please contact support.');
          }
          setPlacing(false);
        },
        modal: {
          ondismiss: () => { setPlacing(false); },
        },
      };
      new window.Razorpay(options).open();
    } catch (err: any) {
      setPayError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to initiate payment.');
      setPlacing(false);
    }
  };

  // ─── Renderers ───────────────────────────────────────────────

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
              i < stepIndex
                ? 'bg-teal-600 text-white'
                : i === stepIndex
                  ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500'
                  : 'bg-gray-100 text-gray-400',
            )}
          >
            {i < stepIndex ? <Check size={14} /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('w-10 h-0.5 mx-1', i < stepIndex ? 'bg-teal-500' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  );

  const renderTemplateStep = () => (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">What would you like to get stitched?</h2>
      <p className="text-sm text-gray-500 mb-2">Choose a template to get started</p>

      {/* Adults 12+ note */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
        <Info size={14} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700">Stitching services are available <strong>only for adults (12+)</strong> on this platform.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-teal-600" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((t) => (
            <button
              key={t.template_type.id}
              type="button"
              onClick={() => setSelectedTemplate(t)}
              className={cn(
                'relative rounded-xl border-2 overflow-hidden text-left transition-all hover:shadow-md',
                selectedTemplate?.template_type.id === t.template_type.id
                  ? 'border-teal-500 ring-2 ring-teal-200'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              {t.template_type.image_url ? (
                <img src={t.template_type.image_url} alt={t.template_type.type_name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Package size={40} className="text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{t.template_type.type_name}</h3>
                  {t.template_type.base_price != null && Number(t.template_type.base_price) > 0 ? (
                    <span className="flex items-center text-sm font-bold text-teal-700">
                      <IndianRupee size={13} />{Number(t.template_type.base_price).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Price TBD</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.template_type.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {t.template_type.category}
                  </span>
                  {t.template_type.estimated_hours && (
                    <span className="text-[10px] text-gray-400">~{t.template_type.estimated_hours}h</span>
                  )}
                </div>
              </div>
              {selectedTemplate?.template_type.id === t.template_type.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => {
    if (!selectedTemplate) return null;
    return (
      <div className="space-y-8">
        {/* ─── Section 1: Measurements ──────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-800">How should we get your measurements?</h2>
            <a
              href={ORDER_CONFIG.MEASUREMENT_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink size={12} /> Measurement Guide
            </a>
          </div>
          <p className="text-sm text-gray-500 mb-5">Choose the method that works best for you</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => { setMeasurementMethod('manual_measurements'); setReferenceConfirmed(false); }}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                measurementMethod === 'manual_measurements'
                  ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <Ruler size={20} className={measurementMethod === 'manual_measurements' ? 'text-teal-600' : 'text-gray-400'} />
              <p className="font-medium text-sm mt-2">Enter Measurements</p>
              <p className="text-xs text-gray-500 mt-0.5">Provide your body measurements manually</p>
            </button>
            <button
              type="button"
              onClick={() => setMeasurementMethod('reference_clothing')}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                measurementMethod === 'reference_clothing'
                  ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <Shirt size={20} className={measurementMethod === 'reference_clothing' ? 'text-amber-600' : 'text-gray-400'} />
              <p className="font-medium text-sm mt-2">Reference Clothing</p>
              <p className="text-xs text-gray-500 mt-0.5">Send similar existing clothes to the tailor</p>
            </button>
          </div>

          {measurementMethod === 'manual_measurements' && (
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
          )}

          {measurementMethod === 'reference_clothing' && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-amber-800">Important — Please read carefully</p>
                    <ul className="mt-2 space-y-1.5 text-xs text-amber-700">
                      <li>• You must have <strong>exactly similar clothes</strong> that match the style you're ordering.</li>
                      <li>• The tailor will measure directly from your reference clothing — any mismatch will cause incorrect sizing.</li>
                      <li>• For example, ordering a kurta? Send a kurta — <strong>not a shirt or t-shirt</strong>.</li>
                      <li>• You'll need to deliver the reference clothes to the tailor before stitching begins.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                  referenceConfirmed ? 'bg-teal-600 border-teal-600' : 'border-gray-300 group-hover:border-gray-400',
                )}>
                  {referenceConfirmed && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm text-gray-700">
                  I confirm that I have <strong>exactly similar clothes</strong> and will provide them to the tailor.
                </span>
                <input type="checkbox" className="hidden" checked={referenceConfirmed} onChange={(e) => setReferenceConfirmed(e.target.checked)} />
              </label>
            </div>
          )}
        </div>

        {/* ─── Section 2: Special Requests (shown after measurement is done) ── */}
        {measurementDone() && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-800">Special Requests</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">Any additional instructions, design preferences, or notes for the tailor? Type below or record an audio note.</p>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="e.g. Slightly loose fit around the waist, add a pocket on the left side, use matching buttons..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{specialRequests.length}/1000</p>

            {/* Audio recording for special instructions */}
            <div className="rounded-xl border border-gray-200 p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Mic size={16} className="text-teal-600" />
                <p className="text-sm font-medium text-gray-700">Record Audio Note (optional)</p>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Prefer to speak your special instructions? Record an audio note (max {ORDER_CONFIG.AUDIO_MAX_DURATION_SECONDS / 60} min) — we'll share it with the tailor.
              </p>
              <div className="flex items-center gap-3">
                {!siIsRecording && !siAudioBlob && (
                  <button
                    type="button"
                    onClick={startSiRecording}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Mic size={14} /> Start Recording
                  </button>
                )}
                {siIsRecording && (
                  <button
                    type="button"
                    onClick={stopSiRecording}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium animate-pulse"
                  >
                    <MicOff size={14} /> Stop Recording
                  </button>
                )}
                {siAudioUrl && !siIsRecording && (
                  <div className="flex items-center gap-3 flex-1">
                    <audio src={siAudioUrl} controls className="h-9 flex-1" />
                    <button
                      type="button"
                      onClick={() => { setSiAudioBlob(null); setSiAudioUrl(null); setSiAudioCloudUrl(''); }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {siUploadingAudio && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading audio...</p>
              )}
            </div>
          </div>
        )}

        {/* ─── Section 3: Delivery Address + Contact (shown after measurement) ── */}
        {measurementDone() && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-800">Delivery Address & Contact</h2>
              </div>
              {geo.status === 'idle' && (
                <button
                  type="button"
                  onClick={geo.requestLocation}
                  className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LocateFixed size={12} /> Auto-detect
                </button>
              )}
              {geo.status === 'loading' && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin" /> Detecting...
                </span>
              )}
              {reverseGeoLoading && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin" /> Fetching address...
                </span>
              )}
            </div>

            {geo.status === 'granted' && geo.location && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                  <p className="text-[10px] uppercase text-gray-400 font-medium">Lat</p>
                  <p className="text-xs text-gray-800 font-mono">{geo.location.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                  <p className="text-[10px] uppercase text-gray-400 font-medium">Lng</p>
                  <p className="text-xs text-gray-800 font-mono">{geo.location.longitude.toFixed(6)}</p>
                </div>
                <div className="bg-teal-50 rounded-lg border border-teal-200 px-3 py-2">
                  <p className="text-[10px] uppercase text-teal-600 font-medium">DigiPIN</p>
                  <p className="text-xs text-teal-800 font-semibold font-mono">{geo.location.digipin}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Flat / House No. <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.flat_number}
                    onChange={(e) => setAddr('flat_number', e.target.value)}
                    placeholder="A-201"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Street / Locality <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.address_line1}
                    onChange={(e) => setAddr('address_line1', e.target.value)}
                    placeholder="MG Road, Andheri West"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    PIN Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.postal_code}
                    onChange={(e) => setAddr('postal_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="400001"
                    maxLength={6}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                  {pincodeLoading && <Loader2 size={14} className="absolute right-3 top-8 animate-spin text-teal-500" />}
                </div>
                {pincodeDistrict && (
                  <p className="text-xs text-teal-600 mt-1 flex items-center gap-1"><MapPin size={10} /> {pincodeDistrict}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">City <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddr('city', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">State <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddr('state', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <Phone size={11} /> Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <Mail size={11} /> Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Section 4: Material Delivery Method ── */}
        {measurementDone() && addressDone() && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">How will you send your material/clothes?</h2>
            <p className="text-sm text-gray-500 mb-4">Choose how you'd like to provide your fabric or reference clothing to the tailor</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('self_parcel')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all',
                  deliveryMethod === 'self_parcel'
                    ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300',
                )}
              >
                <PackageOpen size={20} className={deliveryMethod === 'self_parcel' ? 'text-teal-600' : 'text-gray-400'} />
                <p className="font-medium text-sm mt-2">Self Parcel (Free)</p>
                <p className="text-xs text-gray-500 mt-0.5">You courier/parcel the material to our address within {ORDER_CONFIG.PARCEL_DEADLINE_DAYS} days of placing the order</p>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all',
                  deliveryMethod === 'pickup'
                    ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300',
                )}
              >
                <Truck size={20} className={deliveryMethod === 'pickup' ? 'text-teal-600' : 'text-gray-400'} />
                <p className="font-medium text-sm mt-2">Pickup by our delivery</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Our partner picks up from your address — <strong className="text-teal-700">₹{ORDER_CONFIG.PICKUP_FEE} extra</strong>
                </p>
              </button>
            </div>

            {deliveryMethod === 'self_parcel' && (
              <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Material must reach us within <strong>{ORDER_CONFIG.PARCEL_DEADLINE_DAYS} days</strong> of placing this order. If not received, the order will be <strong>auto-cancelled</strong> and payment refunded.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderReviewStep = () => (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Review your order</h2>
      <p className="text-sm text-gray-500 mb-5">Confirm everything looks correct before paying</p>

      {payError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
          <AlertTriangle size={16} /> {payError}
        </div>
      )}

      <div className="space-y-4">
        {/* Template */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Template</p>
          <div className="flex items-center gap-3">
            {selectedTemplate?.template_type.image_url && (
              <img src={selectedTemplate.template_type.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{selectedTemplate?.template_type.type_name}</p>
              <p className="text-xs text-gray-500">{selectedTemplate?.template_type.category}</p>
            </div>
            <span className="flex items-center text-lg font-bold text-teal-700">
              <IndianRupee size={15} />{Number(templatePrice).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Measurement method */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Measurement Method</p>
          {measurementMethod === 'manual_measurements' ? (
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Ruler size={14} className="text-teal-600" /> Manual Measurements
              </p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(Object.keys(measurements) as (keyof Measurements)[])
                  .filter((k) => measurements[k])
                  .map((k) => (
                    <div key={k} className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <p className="text-[10px] text-gray-400">{measurementLabels[k]}</p>
                      <p className="text-sm font-mono text-gray-700">{measurements[k]}</p>
                    </div>
                  ))}
              </div>
              {audioUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <Mic size={12} className="text-teal-600" />
                  <span className="text-xs text-gray-500">Audio note attached</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-amber-700 flex items-center gap-1.5">
              <Shirt size={14} className="text-amber-600" /> Reference Clothing
              <span className="text-xs text-gray-400 ml-1">— tailor will measure from your clothes</span>
            </p>
          )}
        </div>

        {/* Special requests */}
        {(specialRequests || siAudioUrl) && (
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase font-medium text-gray-400 mb-2">Special Requests</p>
            {specialRequests && <p className="text-sm text-gray-700 whitespace-pre-wrap">{specialRequests}</p>}
            {siAudioUrl && (
              <div className="mt-2 flex items-center gap-2">
                <Mic size={12} className="text-teal-600" />
                <span className="text-xs text-gray-500">Audio note attached</span>
                <audio src={siAudioUrl} controls className="h-8 ml-2" />
              </div>
            )}
          </div>
        )}

        {/* Delivery address */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Delivery Address</p>
          <p className="text-sm text-gray-700">{address.flat_number}, {address.address_line1}</p>
          <p className="text-sm text-gray-500">{address.city}, {address.state} — {address.postal_code}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Phone size={10} /> {contactPhone}</span>
            <span className="flex items-center gap-1"><Mail size={10} /> {contactEmail}</span>
          </div>
        </div>

        {/* Delivery method */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Material Delivery</p>
          {deliveryMethod === 'pickup' ? (
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Truck size={14} className="text-teal-600" /> Pickup by our delivery — ₹{ORDER_CONFIG.PICKUP_FEE}
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <PackageOpen size={14} className="text-teal-600" /> Self Parcel — within {ORDER_CONFIG.PARCEL_DEADLINE_DAYS} days
            </p>
          )}
        </div>

        {/* Price summary */}
        <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Stitching ({selectedTemplate?.template_type.type_name})</span>
              <span className="text-gray-800 font-medium flex items-center"><IndianRupee size={12} />{Number(templatePrice).toLocaleString('en-IN')}</span>
            </div>
            {pickupFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pickup fee</span>
                <span className="text-gray-800 font-medium flex items-center"><IndianRupee size={12} />{pickupFee}</span>
              </div>
            )}
            <div className="border-t border-teal-200 pt-1.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Total</p>
              <span className="flex items-center text-xl font-bold text-teal-700">
                <IndianRupee size={17} />{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Fixed price. No hidden charges.</p>
        </div>
      </div>
    </div>
  );

  const renderConfirmedStep = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-2">
        Your payment was successful and your order has been placed.
      </p>
      {confirmedOrderId && (
        <p className="text-sm text-teal-700 font-medium mb-6">
          Order ID: <span className="font-mono font-bold">#{confirmedOrderId}</span>
        </p>
      )}

      <div className="bg-teal-50 rounded-2xl border border-teal-200 p-5 w-full max-w-sm mb-6">
        <p className="text-sm text-teal-800 font-medium mb-1">What happens next?</p>
        <ul className="text-xs text-teal-700 space-y-1.5 text-left">
          {deliveryMethod === 'self_parcel' ? (
            <>
              <li>• Send your material/reference clothes within {ORDER_CONFIG.PARCEL_DEADLINE_DAYS} days</li>
              <li>• Once received, a tailor will be assigned</li>
              <li>• Track progress in your order history</li>
            </>
          ) : (
            <>
              <li>• Our delivery partner will pick up your material</li>
              <li>• Once collected, a tailor will be assigned</li>
              <li>• Track progress in your order history</li>
            </>
          )}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirmedOrderId) {
            navigate(`/orders/${confirmedOrderId}`);
          } else {
            navigate('/dashboard', { state: { orderSuccess: true } });
          }
        }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors"
      >
        <ClipboardList size={16} /> Check Order Status
      </button>

      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mt-3 text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {step !== 'confirmed' ? (
            <button
              type="button"
              onClick={() => (step === 'template' ? navigate('/dashboard') : goBack())}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={18} /> {step === 'template' ? 'Dashboard' : 'Back'}
            </button>
          ) : <div className="w-16" />}
          <p className="text-sm font-medium text-gray-700">{STEPS[stepIndex >= 0 ? stepIndex : 0].label}</p>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step !== 'confirmed' && renderStepIndicator()}

        {step === 'template' && renderTemplateStep()}
        {step === 'details' && renderDetailsStep()}
        {step === 'review' && renderReviewStep()}
        {step === 'confirmed' && renderConfirmedStep()}
      </div>

      {/* ─── Floating bottom navigation bar ──────────────────── */}
      {step !== 'confirmed' && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur border-t border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (step === 'template' ? navigate('/dashboard') : goBack())}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={16} />
              {step === 'template' ? 'Dashboard' : 'Back'}
            </button>

            <span className="text-xs text-gray-400 hidden sm:block">
              Step {stepIndex + 1} of {STEPS.length}
            </span>

            {step === 'review' ? (
              <button
                type="button"
                disabled={placing}
                onClick={handlePlaceOrder}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:bg-teal-400"
              >
                {placing ? <Loader2 size={16} className="animate-spin" /> : <IndianRupee size={14} />}
                {placing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
              </button>
            ) : (
              <button
                type="button"
                disabled={!canNext()}
                onClick={goNext}
                className={cn(
                  'flex items-center gap-1 px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
                  canNext()
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                )}
              >
                Continue <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
