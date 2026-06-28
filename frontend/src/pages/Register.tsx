import { Eye, EyeOff, Scissors, User, Loader2, Check, X, Upload, FileText, LocateFixed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRegister } from '@/hooks/useRegister';
import { Input } from '@/components/ui/Input';
import { PincodeRow } from '@/components/auth/PincodeRow';
import { cn } from '@/lib/cn';

const passwordChecks = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Special character', test: (v: string) => /[!@#$%^&*()_+\-={}|;:'",.<>?/`~]/.test(v) },
];

export default function Register() {
  const {
    role, setRole,
    showPassword, setShowPassword,
    loading, error, fieldErrors,
    pincodeLoading, pincodeDistrict,
    addressProofFile, handleAddressProofChange,
    form, set, geo,
    handleSubmit,
  } = useRegister();

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
                role === 'consumer' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700',
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
                role === 'tailor' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700',
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
                          onClick={(e) => { e.preventDefault(); handleAddressProofChange(null); }}
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
                        if (file) handleAddressProofChange(file);
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
