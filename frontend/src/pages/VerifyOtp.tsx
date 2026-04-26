import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth';

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session_id, email, otp_expiry_seconds = 300, flow = 'register' } = location.state || {};

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(otp_expiry_seconds);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!session_id || !email) {
      navigate('/register', { replace: true });
    }
  }, [session_id, email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c: number) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authService.verifyOtp({
        email,
        otp: code,
        session_id,
      });

      const data = res.data.data;
      if (data.auth_token) {
        localStorage.setItem('auth_token', data.auth_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data));
      }

      setSuccess(res.data.message || 'Verification successful!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Verification failed. Please try again.';
      setError(msg);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      const res = await authService.requestOtp({ email });
      const newSession = res.data.data.session_id;
      const newExpiry = res.data.data.otp_expiry_seconds || 300;
      location.state.session_id = newSession;
      setCountdown(newExpiry);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  if (!session_id || !email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg shadow-teal-900/5 border border-gray-100 p-8">
          {/* Back link */}
          <Link
            to={flow === 'register' ? '/register' : '/login'}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700 mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          {/* Icon */}
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-5">
            <Mail className="text-teal-700" size={24} />
          </div>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-1">
            Check your email
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-gray-700">{email}</span>
          </p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP inputs */}
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-xl font-semibold bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  disabled={loading || !!success}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center text-sm text-gray-500 mb-6">
              {countdown > 0 ? (
                <span>Code expires in <span className="font-medium text-teal-700">{formatTime(countdown)}</span></span>
              ) : (
                <span className="text-red-500 font-medium">Code expired</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== OTP_LENGTH || !!success}
              className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Verifying...' : success ? 'Redirecting...' : 'Verify email'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={handleResend}
              disabled={countdown > 0}
              className="text-sm text-teal-700 font-medium hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
