import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Loader2,
  CheckCircle2,
  IndianRupee,
  X,
  Pencil,
  Save,
  MapPin,
  Zap,
  Gift,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import api from '@/services/api';

type Tab = 'home' | 'orders' | 'profile' | 'support';

interface OrderSummary {
  order_id: number;
  order_status: string;
  consumer_id: number;
  tailor_id: number | null;
  tailor_name: string | null;
  number_of_items: number;
  final_amount: number;
  delivery_date: string;
  created_at: string;
  items_summary: string;
  status_updated_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  created: { bg: 'bg-blue-50', text: 'text-blue-700' },
  awaiting_material: { bg: 'bg-amber-50', text: 'text-amber-700' },
  material_received: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  tailor_assigned: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  cutting_started: { bg: 'bg-purple-50', text: 'text-purple-700' },
  stitching_in_progress: { bg: 'bg-violet-50', text: 'text-violet-700' },
  final_touch: { bg: 'bg-pink-50', text: 'text-pink-700' },
  ready_for_collection: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  completed: { bg: 'bg-green-50', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
};

const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState<Tab>((location.state as any)?.orderSuccess ? 'orders' : 'home');
  const [successBanner, setSuccessBanner] = useState(!!(location.state as any)?.orderSuccess);

  // Order history state
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Support tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<any>(null);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

  // Profile state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '' as 'success' | 'error' | '', text: '' });
  const [profile, setProfile] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    bio: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
  });

  // Clear location state so refresh doesn't re-show banner
  useEffect(() => {
    if ((location.state as any)?.orderSuccess) {
      window.history.replaceState({}, '');
      const t = setTimeout(() => setSuccessBanner(false), 6000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && !ordersLoaded) fetchOrders();
    if (activeTab === 'profile' && !profileLoaded) fetchProfile();
    if (activeTab === 'support' && !ticketsLoaded) fetchTickets();
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const userId = user.user_id;
      if (!userId) { setOrdersError('User ID not found'); setOrdersLoading(false); return; }
      const res = await api.get(`/orders/history/${userId}`);
      setOrders(res.data?.data?.orders || res.data?.orders || []);
      setOrdersLoaded(true);
    } catch (err: any) {
      setOrdersError(err.response?.data?.message || 'Failed to load orders');
    }
    setOrdersLoading(false);
  };

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await api.get('/support/tickets');
      setTickets(res.data?.data || res.data || []);
      setTicketsLoaded(true);
    } catch {}
    setTicketsLoading(false);
  };

  const toggleTicketDetail = async (ticketId: number) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
      setTicketDetail(null);
      return;
    }
    setExpandedTicket(ticketId);
    setTicketDetailLoading(true);
    try {
      const res = await api.get(`/support/tickets/${ticketId}`);
      setTicketDetail(res.data?.data || res.data);
    } catch {
      setTicketDetail(null);
    }
    setTicketDetailLoading(false);
  };

  const handleResolveTicket = async (ticketId: number) => {
    setResolving(true);
    try {
      await api.patch(`/support/tickets/${ticketId}/resolve`, { resolution_notes: 'Resolved by user' });
      // Update local state
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, ticket_status: 'resolved', resolved_at: new Date().toISOString() } : t));
      setTicketDetail((d: any) => d ? { ...d, ticket_status: 'resolved', resolved_at: new Date().toISOString(), resolution_type: 'self_resolved' } : d);
    } catch {}
    setResolving(false);
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get(`/user/details/${user.user_id}`);
      const d = res.data?.data || res.data;
      const cp = d.consumer_profile || {};
      setProfile({
        first_name: d.first_name || '',
        last_name: d.last_name || '',
        bio: cp.bio || '',
        address_line1: cp.address_line1 || '',
        address_line2: cp.address_line2 || '',
        city: cp.city || '',
        state: cp.state || '',
        postal_code: cp.postal_code || '',
      });
      setProfileLoaded(true);
    } catch {}
    setProfileLoading(false);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await api.put(`/user/details/${user.user_id}`, profile);
      // Update localStorage with new name
      const updatedUser = { ...user, first_name: profile.first_name, last_name: profile.last_name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
      setProfileEditing(false);
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
    setProfileSaving(false);
  };

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
          onClick={() => navigate('/express-order')}
          className="flex items-center gap-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl p-5 text-left transition-colors group"
        >
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 flex items-center gap-1.5">Express / Gift <Gift size={14} className="text-pink-400" /></p>
            <p className="text-xs text-gray-500 mt-0.5">
              Rush order or gift for someone special
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
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

      {ordersLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-teal-600" size={28} />
        </div>
      )}

      {ordersError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} /> {ordersError}
          <button type="button" onClick={fetchOrders} className="ml-auto text-xs font-medium underline">Retry</button>
        </div>
      )}

      {!ordersLoading && !ordersError && orders.length === 0 && (
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
      )}

      {!ordersLoading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((o) => {
            const sc = STATUS_COLORS[o.order_status] || { bg: 'bg-gray-50', text: 'text-gray-700' };
            return (
              <button
                key={o.order_id}
                type="button"
                onClick={() => navigate(`/orders/${o.order_id}`)}
                className="w-full bg-white rounded-2xl border border-gray-100 hover:border-gray-200 p-4 text-left transition-all hover:shadow-sm group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">#{o.order_id}</span>
                  <span className={cn('text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
                    {formatStatus(o.order_status)}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 text-sm">{o.items_summary || 'Order'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center text-sm font-bold text-teal-700">
                    <IndianRupee size={13} />{Number(o.final_amount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-end mt-1">
                  <span className="text-xs text-gray-400 group-hover:text-teal-600 flex items-center gap-0.5 transition-colors">
                    View details <ChevronRight size={12} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── Profile Tab ─────────────────────────────────────────────
  const renderProfile = () => {
    if (profileLoading) {
      return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-teal-600" size={28} /></div>;
    }

    const inputCls = (editable: boolean) =>
      cn(
        'w-full rounded-lg px-3 py-2 text-sm border transition-colors',
        editable ? 'border-gray-300 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none' : 'border-transparent bg-gray-50 text-gray-700 cursor-default',
      );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
          {!profileEditing ? (
            <button
              type="button"
              onClick={() => setProfileEditing(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setProfileEditing(false); fetchProfile(); }}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                disabled={profileSaving}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-4 py-1.5 rounded-lg transition-colors disabled:bg-teal-400"
              >
                {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </div>
          )}
        </div>

        {profileMsg.text && (
          <div className={cn(
            'text-sm px-4 py-2.5 rounded-lg flex items-center gap-2',
            profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200',
          )}>
            {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {profileMsg.text}
          </div>
        )}

        {/* Account info (read-only) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs uppercase font-medium text-gray-400 mb-3">Account</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase text-gray-400 font-medium">Email</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{user.email || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase text-gray-400 font-medium">Phone</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{user.phone_number || '—'}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Email and phone cannot be changed</p>
        </div>

        {/* Personal info (editable) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs uppercase font-medium text-gray-400 mb-3">Personal Info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">First Name</label>
              <input
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                readOnly={!profileEditing}
                className={inputCls(profileEditing)}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
              <input
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                readOnly={!profileEditing}
                className={inputCls(profileEditing)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-500 mb-1 block">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              readOnly={!profileEditing}
              rows={2}
              className={inputCls(profileEditing)}
              placeholder="Tell us about yourself"
            />
          </div>
        </div>

        {/* Default Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-teal-600" />
            <p className="text-xs uppercase font-medium text-gray-400">Default Address</p>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">This address will be pre-filled when you place new orders</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Address Line 1</label>
              <input
                value={profile.address_line1}
                onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
                readOnly={!profileEditing}
                className={inputCls(profileEditing)}
                placeholder="Street address, building name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Address Line 2</label>
              <input
                value={profile.address_line2}
                onChange={(e) => setProfile({ ...profile, address_line2: e.target.value })}
                readOnly={!profileEditing}
                className={inputCls(profileEditing)}
                placeholder="Apartment, flat, floor (optional)"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">City</label>
                <input
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  readOnly={!profileEditing}
                  className={inputCls(profileEditing)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">State</label>
                <input
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  readOnly={!profileEditing}
                  className={inputCls(profileEditing)}
                  placeholder="State"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Postal Code</label>
                <input
                  value={profile.postal_code}
                  onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                  readOnly={!profileEditing}
                  className={inputCls(profileEditing)}
                  placeholder="PIN code"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TICKET_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-blue-50', text: 'text-blue-700' },
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700' },
    waiting_for_customer: { bg: 'bg-orange-50', text: 'text-orange-700' },
    waiting_for_tailor: { bg: 'bg-purple-50', text: 'text-purple-700' },
    resolved: { bg: 'bg-green-50', text: 'text-green-700' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-500' },
  };

  const PRIORITY_COLORS: Record<string, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  };

  // ─── Support Tab ─────────────────────────────────────────────
  const renderSupport = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Support</h2>

      {/* Actions */}
      <div className="flex items-center gap-3">
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

      {/* Ticket History */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase font-medium text-gray-400">Your Tickets</p>
          {ticketsLoaded && tickets.length > 0 && (
            <button
              type="button"
              onClick={() => { setTicketsLoaded(false); fetchTickets(); }}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
            >
              Refresh
            </button>
          )}
        </div>

        {ticketsLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-teal-600" size={24} />
          </div>
        )}

        {!ticketsLoading && tickets.length === 0 && (
          <div className="text-center py-6">
            <LifeBuoy size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No support tickets yet</p>
          </div>
        )}

        {!ticketsLoading && tickets.length > 0 && (
          <div className="space-y-3">
            {tickets.map((t: any) => {
              const sc = TICKET_STATUS_COLORS[t.ticket_status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
              const isExpanded = expandedTicket === t.id;
              return (
                <div key={t.id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleTicketDetail(t.id)}
                    className="w-full text-left p-3.5"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono text-gray-400">#{t.id}</span>
                      <span className={cn('text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
                        {(t.ticket_status || '').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{t.subject}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="capitalize">{(t.ticket_type || '').replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span className={PRIORITY_COLORS[t.priority] || 'text-gray-500'}>
                        {t.priority} priority
                      </span>
                      {t.order_id && (
                        <>
                          <span>•</span>
                          <span>Order #{t.order_id}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400">
                        {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {t.resolved_at && (
                        <span className="text-[10px] text-green-600">
                          Resolved {new Date(t.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 space-y-3">
                      {ticketDetailLoading ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-teal-600" size={20} /></div>
                      ) : ticketDetail ? (
                        <>
                          <div>
                            <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Description</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticketDetail.description}</p>
                          </div>
                          {ticketDetail.attachments && ticketDetail.attachments.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Attachments</p>
                              <div className="flex gap-2 flex-wrap">
                                {ticketDetail.attachments.map((url: string, i: number) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline">
                                    Attachment {i + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {ticketDetail.resolution_notes && (
                            <div>
                              <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Resolution Notes</p>
                              <p className="text-sm text-gray-700">{ticketDetail.resolution_notes}</p>
                            </div>
                          )}
                          {/* Self-resolve button */}
                          {ticketDetail.ticket_status !== 'resolved' && ticketDetail.ticket_status !== 'closed' && (
                            <button
                              type="button"
                              onClick={() => handleResolveTicket(t.id)}
                              disabled={resolving}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:bg-green-400"
                            >
                              {resolving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                              Mark as Resolved
                            </button>
                          )}
                          {ticketDetail.ticket_status === 'resolved' && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircle2 size={16} /> This ticket is resolved
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">Failed to load details</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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

      {/* Success Banner */}
      {successBanner && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Order placed successfully!</p>
              <p className="text-xs text-green-600">Your payment was confirmed and order has been created.</p>
            </div>
            <button type="button" onClick={() => setSuccessBanner(false)} className="text-green-400 hover:text-green-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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
