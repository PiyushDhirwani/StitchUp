import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.requestOtp({ email });
      const { session_id, otp_expiry_seconds } = res.data.data;
      navigate('/verify-otp', {
        state: {
          session_id,
          email,
          otp_expiry_seconds,
          flow: 'login',
        },
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg shadow-teal-900/5 border border-gray-100 p-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="StitchUp" className="w-20 h-20 object-contain" />
          </div>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-1 text-center">
            Welcome back
          </h2>
          <p className="text-gray-500 text-sm mb-8 text-center">
            Enter your email to receive a login code
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Sending code...' : 'Send login code'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-700 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
