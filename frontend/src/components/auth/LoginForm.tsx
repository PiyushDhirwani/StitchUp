import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LoginMode } from '@/types/auth.types';
import type { FormEvent } from 'react';

interface LoginFormProps {
  mode: LoginMode;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  loading: boolean;
  error: string;
  switchMode: (m: LoginMode) => void;
  handleSubmit: (e: FormEvent) => void;
}

export function LoginForm({
  mode,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  error,
  switchMode,
  handleSubmit,
}: LoginFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-teal-900/5 border border-gray-100 p-8">
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="StitchUp" className="w-20 h-20 object-contain" />
      </div>

      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-1 text-center">
        Welcome back
      </h2>
      <p className="text-gray-500 text-sm mb-6 text-center">
        Sign in to your StitchUp account
      </p>

      {/* Mode toggle */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => switchMode('otp')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === 'otp' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Email OTP
        </button>
        <button
          type="button"
          onClick={() => switchMode('password')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === 'password' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Password
        </button>
      </div>

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

        {mode === 'password' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading
            ? mode === 'otp' ? 'Sending code...' : 'Signing in...'
            : mode === 'otp' ? 'Send login code' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-teal-700 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
