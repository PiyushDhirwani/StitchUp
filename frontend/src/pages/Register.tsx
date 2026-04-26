import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Scissors, User, Loader2, MapPin, Check, X, Upload, FileText, LocateFixed } from 'lucide-react';
import { authService } from '@/services/auth';
import { lookupPincode } from '@/services/pincode';
import { useGeolocation } from '@/hooks/useGeolocation';
import { validators, type FieldErrors } from '@/lib/validate';
import { cn } from '@/lib/cn';

type Role = 'consumer' | 'tailor';

const passwordChecks = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Special character', test: (v: string) => /[!@#$%^&*()_+\-={}|;:'",.<>?/`~]/.test(v) },
];

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('consumer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDistrict, setPincodeDistrict] = useState('');
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const geo = useGeolocation();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    shop_name: '',
    shop_address: '',
    years_of_experience: '',
    aadhar_number: '',
  });

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePincodeLookup = useCallback(async (pincode: string) => {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeDistrict('');
      return;
    }
    setPincodeLoading(true);
    const result = await lookupPincode(pincode);
    setPincodeLoading(false);
    if (result) {
      setForm((prev) => ({ ...prev, city: result.city, state: result.state }));
      setPincodeDistrict(result.district);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.city;
        delete next.state;
        delete next.postal_code;
        return next;
      });
    } else {
      setPincodeDistrict('');
      setFieldErrors((prev) => ({ ...prev, postal_code: 'Invalid PIN code' }));
    }
  }, []);

  useEffect(() => {
    const pin = form.postal_code;
    if (pin.length === 6) {
      const timeout = setTimeout(() => handlePincodeLookup(pin), 300);
      return () => clearTimeout(timeout);
    } else {
      setPincodeDistrict('');
    }
  }, [form.postal_code, handlePincodeLookup]);

  const validateBeforeSubmit = (): boolean => {
    const errors: FieldErrors = {};
    if (!form.first_name.trim()) errors.first_name = 'Required';
    if (!form.last_name.trim()) errors.last_name = 'Required';

    const emailErr = validators.email(form.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validators.phone(form.phone_number);
    if (phoneErr) errors.phone_number = phoneErr;

    const passErr = validators.password(form.password);
    if (passErr) errors.password = passErr;

    const pinErr = validators.pincode(form.postal_code);
    if (pinErr) errors.postal_code = pinErr;

    if (!form.city.trim()) errors.city = 'Required';
    if (!form.state.trim()) errors.state = 'Required';

    if (role === 'consumer') {
      if (!form.address_line1.trim()) errors.address_line1 = 'Required';
    }
    if (role === 'tailor') {
      if (!form.shop_name.trim()) errors.shop_name = 'Required';
      if (!form.shop_address.trim()) errors.shop_address = 'Required';
      const aadharErr = validators.aadhar(form.aadhar_number);
      if (aadharErr) errors.aadhar_number = aadharErr;
      if (!addressProofFile) errors.address_proof = 'Address proof document is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateBeforeSubmit()) return;
    setLoading(true);

    try {
      let res;
      if (role === 'consumer') {
        res = await authService.registerConsumer({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
          address_line1: form.address_line1,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
          latitude: geo.location?.latitude,
          longitude: geo.location?.longitude,
          digipin: geo.location?.digipin,
        });
      } else {
        res = await authService.registerTailor({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
          shop_name: form.shop_name,
          shop_address: form.shop_address,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
          years_of_experience: Number(form.years_of_experience) || 0,
          aadhar_number: form.aadhar_number,
          address_proof: addressProofFile || undefined,
          latitude: geo.location?.latitude,
          longitude: geo.location?.longitude,
          digipin: geo.location?.digipin,
        });
      }

      const { session_id, otp_expiry_seconds } = res.data.data;
      navigate('/verify-otp', {
        state: {
          session_id,
          email: form.email,
          otp_expiry_seconds,
          flow: 'register',
        },
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-gradient-to-b from-teal-700 to-teal-900 text-white flex-col justify-center items-center p-12">
        <img src="/logo.png" alt="StitchUp" className="w-40 h-40 object-contain mb-6 drop-shadow-lg" />
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">StitchUp</h1>
        <p className="text-teal-200 text-sm tracking-wide uppercase">Tailoring at Your Doorstep</p>
        <div className="mt-12 space-y-4 text-teal-100 text-sm max-w-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">1</div>
            <p>Create your account as a customer or tailor</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">2</div>
            <p>Verify your email with a one-time code</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">3</div>
            <p>Start exploring tailors or accepting orders</p>
          </div>
        </div>
      </div>

      {/* Right form area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src="/logo.png" alt="StitchUp" className="w-20 h-20 object-contain" />
          </div>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-1">
            Create your account
          </h2>
          <p className="text-gray-500 text-sm mb-6">Join StitchUp and get started in minutes</p>

          {/* Role toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('consumer')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                role === 'consumer'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <User size={16} />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('tailor')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                role === 'tailor'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <Scissors size={16} />
              Tailor
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={form.first_name} onChange={(v) => set('first_name', v)} error={fieldErrors.first_name} />
              <Input label="Last name" value={form.last_name} onChange={(v) => set('last_name', v)} error={fieldErrors.last_name} />
            </div>

            <Input label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} error={fieldErrors.email} placeholder="you@example.com" />
            <Input label="Phone number" type="tel" value={form.phone_number} onChange={(v) => set('phone_number', v.replace(/\D/g, '').slice(0, 10))} error={fieldErrors.phone_number} placeholder="9876543210" maxLength={10} />

            {/* Location Permission */}
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <LocateFixed size={16} className="text-teal-600" /> Location
                </p>
                {geo.status === 'idle' && (
                  <button
                    type="button"
                    onClick={geo.requestLocation}
                    className="text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Allow location access
                  </button>
                )}
                {geo.status === 'loading' && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Loader2 size={14} className="animate-spin" /> Detecting...
                  </span>
                )}
              </div>

              {geo.status === 'granted' && geo.location && (
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                    <p className="text-[10px] uppercase text-gray-400 font-medium">Lat</p>
                    <p className="text-sm text-gray-800 font-mono">{geo.location.latitude.toFixed(6)}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                    <p className="text-[10px] uppercase text-gray-400 font-medium">Lng</p>
                    <p className="text-sm text-gray-800 font-mono">{geo.location.longitude.toFixed(6)}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg border border-teal-200 px-3 py-2">
                    <p className="text-[10px] uppercase text-teal-600 font-medium">DigiPIN</p>
                    <p className="text-sm text-teal-800 font-semibold font-mono">{geo.location.digipin}</p>
                  </div>
                </div>
              )}

              {(geo.status === 'denied' || geo.status === 'error') && (
                <p className="text-xs text-amber-600 mt-1">{geo.errorMsg}</p>
              )}

              {geo.status === 'idle' && (
                <p className="text-xs text-gray-400">Helps us find nearby tailors and calculate delivery</p>
              )}
            </div>

            {/* Password with strength indicator */}
            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(v) => set('password', v)}
                  error={fieldErrors.password}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {passwordChecks.map((check) => {
                    const pass = check.test(form.password);
                    return (
                      <span key={check.label} className={cn('flex items-center gap-1 text-xs', pass ? 'text-green-600' : 'text-gray-400')}>
                        {pass ? <Check size={12} /> : <X size={12} />}
                        {check.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Consumer fields */}
            {role === 'consumer' && (
              <>
                <Input label="Address" value={form.address_line1} onChange={(v) => set('address_line1', v)} error={fieldErrors.address_line1} placeholder="123 Main Street" />
                <PincodeRow
                  form={form}
                  set={set}
                  fieldErrors={fieldErrors}
                  pincodeLoading={pincodeLoading}
                  pincodeDistrict={pincodeDistrict}
                />
              </>
            )}

            {/* Tailor fields */}
            {role === 'tailor' && (
              <>
                <Input label="Shop name" value={form.shop_name} onChange={(v) => set('shop_name', v)} error={fieldErrors.shop_name} />
                <Input label="Shop address" value={form.shop_address} onChange={(v) => set('shop_address', v)} error={fieldErrors.shop_address} />
                <PincodeRow
                  form={form}
                  set={set}
                  fieldErrors={fieldErrors}
                  pincodeLoading={pincodeLoading}
                  pincodeDistrict={pincodeDistrict}
                />
                <Input
                  label="Years of experience"
                  type="number"
                  value={form.years_of_experience}
                  onChange={(v) => set('years_of_experience', v)}
                  placeholder="e.g. 5"
                />

                {/* Aadhaar + Address Proof */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">Identity Verification</p>
                  <Input
                    label="Aadhaar Number"
                    value={form.aadhar_number}
                    onChange={(v) => set('aadhar_number', v.replace(/\D/g, '').slice(0, 12))}
                    error={fieldErrors.aadhar_number}
                    placeholder="xxxx xxxx xxxx"
                    maxLength={12}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Proof (Aadhaar / Utility Bill / Voter ID)
                  </label>
                  <label
                    className={cn(
                      'flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                      fieldErrors.address_proof
                        ? 'border-red-300 bg-red-50'
                        : addressProofFile
                          ? 'border-teal-300 bg-teal-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100',
                    )}
                  >
                    {addressProofFile ? (
                      <div className="flex items-center gap-2 text-teal-700">
                        <FileText size={20} />
                        <span className="text-sm font-medium truncate max-w-[200px]">{addressProofFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setAddressProofFile(null); }}
                          className="text-gray-400 hover:text-red-500 ml-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Upload size={24} className="mb-1" />
                        <span className="text-sm">Click to upload document</span>
                        <span className="text-xs text-gray-300 mt-0.5">PDF, JPG, PNG — Max 5MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAddressProofFile(file);
                          if (fieldErrors.address_proof) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.address_proof;
                              return next;
                            });
                          }
                        }
                      }}
                    />
                  </label>
                  {fieldErrors.address_proof && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.address_proof}</p>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function PincodeRow({
  form,
  set,
  fieldErrors,
  pincodeLoading,
  pincodeDistrict,
}: {
  form: Record<string, string>;
  set: (field: string, value: string) => void;
  fieldErrors: FieldErrors;
  pincodeLoading: boolean;
  pincodeDistrict: string;
}) {
  return (
    <>
      <div>
        <div className="relative">
          <Input
            label="PIN Code"
            value={form.postal_code}
            onChange={(v) => set('postal_code', v.replace(/\D/g, '').slice(0, 6))}
            error={fieldErrors.postal_code}
            placeholder="400001"
            maxLength={6}
          />
          {pincodeLoading && (
            <Loader2 size={16} className="absolute right-3 top-9 animate-spin text-teal-500" />
          )}
        </div>
        {pincodeDistrict && (
          <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
            <MapPin size={12} /> {pincodeDistrict}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={form.city} onChange={(v) => set('city', v)} error={fieldErrors.city} disabled={pincodeLoading} />
        <Input label="State" value={form.state} onChange={(v) => set('state', v)} error={fieldErrors.state} disabled={pincodeLoading} />
      </div>
    </>
  );
}

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  disabled,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-500',
          error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-teal-500',
        )}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
