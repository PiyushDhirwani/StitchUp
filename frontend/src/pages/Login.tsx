import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm
          mode={auth.mode}
          email={auth.email}
          setEmail={auth.setEmail}
          password={auth.password}
          setPassword={auth.setPassword}
          showPassword={auth.showPassword}
          setShowPassword={auth.setShowPassword}
          loading={auth.loading}
          error={auth.error}
          switchMode={auth.switchMode}
          handleSubmit={auth.handleSubmit}
        />
      </div>
    </div>
  );
}
