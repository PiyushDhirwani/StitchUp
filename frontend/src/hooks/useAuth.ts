import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import type { LoginMode } from '@/types/auth.types';

export function useAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (m: LoginMode) => {
    setMode(m);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'otp') {
        const res = await authService.requestOtp({ email });
        const { session_id, otp_expiry_seconds } = res.data.data;
        navigate('/verify-otp', { state: { session_id, email, otp_expiry_seconds, flow: 'login' } });
      } else {
        const res = await authService.loginWithPassword({ email, password });
        const { auth_token, refresh_token, role, consumer_id, tailor_id, user_id, first_name } = res.data.data;
        localStorage.setItem('auth_token', auth_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_id', String(user_id));
        localStorage.setItem('first_name', first_name ?? '');
        if (consumer_id) localStorage.setItem('consumer_id', String(consumer_id));
        if (tailor_id) localStorage.setItem('tailor_id', String(tailor_id));
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
