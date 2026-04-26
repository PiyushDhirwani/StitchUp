import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="StitchUp" className="w-10 h-10 object-contain" />
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">StitchUp</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user.first_name || user.email || 'User'}!
          </h1>
          <p className="text-gray-500 mb-6">You're signed in as <span className="font-medium text-teal-700">{user.role}</span></p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-teal-50 rounded-xl p-5">
              <p className="text-sm text-teal-600 font-medium">User ID</p>
              <p className="text-lg font-semibold text-teal-900 mt-1">{user.user_id || '—'}</p>
            </div>
            <div className="bg-coral-50 rounded-xl p-5">
              <p className="text-sm text-coral-600 font-medium">Email</p>
              <p className="text-lg font-semibold text-gray-900 mt-1 truncate">{user.email || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Phone</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{user.phone_number || '—'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
