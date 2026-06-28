import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService, type Template } from '@/services/templates';
import { lookupPincode } from '@/services/pincode';
import { useGeolocation } from '@/hooks/useGeolocation';
import api from '@/services/api';
import { ORDER_CONFIG } from '@/config/order.config';
import type { OrderStep, MeasurementMethod, DeliveryMethod, Measurements, DeliveryAddress } from '@/types/order.types';

const STEPS: { key: OrderStep; label: string }[] = [
  { key: 'template', label: 'Choose Template' },
  { key: 'details', label: 'Measurements & Details' },
  { key: 'review', label: 'Review & Pay' },
  { key: 'confirmed', label: 'Order Confirmed' },
];

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useNewOrder() {
  const navigate = useNavigate();
  const geo = useGeolocation();

  const [step, setStep] = useState<OrderStep>('template');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);

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
  const [address, setAddress] = useState<DeliveryAddress>({ flat_number: '', address_line1: '', city: '', state: '', postal_code: '' });
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDistrict, setPincodeDistrict] = useState('');
  const [reverseGeoLoading, setReverseGeoLoading] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('self_parcel');

  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);

  useEffect(() => {
    templateService
      .getAll()
      .then((res) => setTemplates(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.phone_number) setContactPhone(u.phone_number);
      if (u.email) setContactEmail(u.email);
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

  useEffect(() => {
    if (geo.status === 'granted' && geo.location && !address.address_line1) {
      reverseGeocode();
    }
  }, [geo.status, geo.location, reverseGeocode, address.address_line1]);

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

  const setAddr = (key: keyof DeliveryAddress, value: string) => setAddress((a) => ({ ...a, [key]: value }));
  const setMeasure = (key: keyof Measurements, value: string) =>
    setMeasurements((prev) => ({ ...prev, [key]: value.replace(/[^\d.]/g, '') }));

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPayError('');

    try {
      let audioFileUrl = audioCloudUrl;
      if (audioBlob && !audioCloudUrl) {
        audioFileUrl = await uploadAudioToCloudinary();
      }

      let siAudioFileUrl = siAudioCloudUrl;
      if (siAudioBlob && !siAudioCloudUrl) {
        siAudioFileUrl = await uploadSiAudioToCloudinary();
      }

      const { data: rzData } = await api.post('/payments/create-order', {
        template_type_id: selectedTemplate!.template_type.id,
        amount: totalAmount,
      });
      const { razorpay_order_id, amount, currency, key_id } = rzData.data;

      const loaded = await loadRazorpay();
      if (!loaded) { setPayError('Failed to load payment gateway. Please try again.'); setPlacing(false); return; }

      const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  return {
    STEPS,
    step,
    stepIndex,
    loading,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    measurementMethod,
    setMeasurementMethod,
    measurements,
    setMeasure,
    referenceConfirmed,
    setReferenceConfirmed,
    specialRequests,
    setSpecialRequests,
    isRecording,
    audioBlob,
    audioUrl,
    uploadingAudio,
    setAudioBlob,
    setAudioUrl,
    setAudioCloudUrl,
    startRecording,
    stopRecording,
    siIsRecording,
    siAudioBlob,
    siAudioUrl,
    siUploadingAudio,
    setSiAudioBlob,
    setSiAudioUrl,
    setSiAudioCloudUrl,
    startSiRecording,
    stopSiRecording,
    address,
    setAddr,
    contactPhone,
    setContactPhone,
    contactEmail,
    setContactEmail,
    pincodeLoading,
    pincodeDistrict,
    reverseGeoLoading,
    deliveryMethod,
    setDeliveryMethod,
    placing,
    payError,
    confirmedOrderId,
    templatePrice,
    pickupFee,
    totalAmount,
    measurementDone,
    addressDone,
    canNext,
    goNext,
    goBack,
    handlePlaceOrder,
    geo,
    navigate,
    emptyMeasurements,
  };
}
