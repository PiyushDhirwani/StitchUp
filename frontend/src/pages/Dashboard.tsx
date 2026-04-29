import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Scissors,
  ClipboardList,
  UserCircle,
  LifeBuoy,
  Plus,
  ChevronRight,
  Package,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';

type Tab = 'home' | 'orders' | 'profile' | 'support';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const tabs: { key: Tab; label: string; icon: typeof Scissors }[] = [
    { key: 'home', label: 'Home', icon: Scissors },
    { key: 'orders', label: 'Orders', icon: ClipboardList },
    { key: 'profile', label: 'Profile', icon: UserCircle },
    { key: 'support', label: 'Support', icon: LifeBuoy },
  ];

  // ─── Home Tab ────────────────────────────────────────────────
  const renderHome = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.first_name || user.email || 'User'}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          What would you like to do today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => navigate('/new-order')}
          className="flex items-center gap-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl p-5 text-left transition-colors group"
        >
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <Plus size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">New Order</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Browse templates & place a stitching order
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className="flex items-center gap-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left transition-colors group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <Package size={22} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Order History</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Track & manage your existing orders
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left transition-colors group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <UserCircle size={22} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">My Profile</p>
            <p className="text-xs text-gray-500 mt-0.5">
              View & edit your personal details
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className="flex items-center gap-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left transition-colors group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <LifeBuoy size={22} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Support</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Raise a concern or share feedback
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs uppercase font-medium text-gray-400 mb-3">Account Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase text-gray-400 font-medium">Role</p>
            <p className="text-sm font-semibold text-teal-700 capitalize mt-0.5">{user.role || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase text-gray-400 font-medium">Email</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{user.email || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase text-gray-400 font-medium">Phone</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{user.phone_number || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Orders Tab ──────────────────────────────────────────────
  const renderOrders = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Order History</h2>
        <button
          type="button"
          onClick={() => navigate('/new-order')}
          className="flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={14} /> New Order
        </button>
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <Clock size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-700">No orders yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Your order history will appear here once you place your first order.
        </p>
        <button
          type="button"
          onClick={() => navigate('/new-order')}
          className="mt-4 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Place your first order
        </button>
      </div>
    </div>
  );

  // ─── Profile Tab ─────────────────────────────────────────────
  const renderProfile = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        {[
          { label: 'Name', value: `${user.first_name || ''} ${user.last_name || ''}`.trim() || '—' },
          { label: 'Email', value: user.email || '—' },
          { label: 'Phone', value: user.phone_number || '—' },
          { label: 'Role', value: user.role || '—' },
          { label: 'User ID', value: user.user_id || '—' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <p className="text-sm text-gray-500">{row.label}</p>
            <p className="text-sm font-medium text-gray-800">{row.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">Profile editing coming soon</p>
    </div>
  );

  // ─── Support Tab ─────────────────────────────────────────────
  const renderSupport = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Support</h2>

      {/* Sub-tabs for Grievance / Feedback */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate('/support/grievance')}
            className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-4 text-left transition-colors"
          >
            <AlertCircle size={20} className="text-red-500 mb-2" />
            <p className="font-semibold text-sm text-gray-800">Raise Grievance</p>
            <p className="text-xs text-gray-500 mt-0.5">Report an issue with your order</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/support/feedback')}
            className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-left transition-colors"
          >
            <ClipboardList size={20} className="text-blue-500 mb-2" />
            <p className="font-semibold text-sm text-gray-800">Share Feedback</p>
            <p className="text-xs text-gray-500 mt-0.5">Rate your experience or suggest improvements</p>
          </button>
        </div>

        {/* Previous tickets - empty state */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-3">Your Tickets</p>
          <div className="text-center py-6">
            <LifeBuoy size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No support tickets yet</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors size={20} className="text-teal-600" />
            <span className="font-bold text-gray-900">StitchUp</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'support' && renderSupport()}
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:sticky sm:top-14 z-20">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors',
                  active ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
