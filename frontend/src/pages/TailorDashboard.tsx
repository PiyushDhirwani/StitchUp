import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Scissors,
  ClipboardList,
  UserCircle,
  Star,
  Package,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  IndianRupee,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import api from '@/services/api';
import { validateImageFile } from '@/lib/validate';

type Tab = 'available' | 'orders' | 'history' | 'feedback' | 'profile';

const TAILOR_STATUS_LABELS: Record<string, string> = {
  tailor_assigned: 'Accepted',
  cutting_started: 'Cutting',
  stitching_in_progress: 'Stitching',
  final_touch: 'Final Touch',
  ready_for_collection: 'Stitched',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const NEXT_ACTION: Record<string, { label: string; next: string }> = {
  tailor_assigned: { label: 'Start Stitching', next: 'stitching_in_progress' },
  cutting_started: { label: 'Start Stitching', next: 'stitching_in_progress' },
  stitching_in_progress: { label: 'Mark Stitched', next: 'ready_for_collection' },
};

const ACTIVE_STATUSES = ['tailor_assigned', 'cutting_started', 'stitching_in_progress', 'final_touch'];

export default function TailorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [kycStatus, setKycStatus] = useState<string>(user.kyc_status || 'pending');
  const [activeTab, setActiveTab] = useState<Tab>('available');
  const [banner, setBanner] = useState({ type: '' as 'success' | 'error' | '', text: '' });

  const [available, setAvailable] = useState<any>(null);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [actioning, setActioning] = useState<number | null>(null);

  const [documents, setDocuments] = useState<any[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ shop_name: '', bio: '', years_of_experience: '' });
  const [photoUploading, setPhotoUploading] = useState(false);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner({ type: '', text: '' }), 5000);
  };

  const refreshKyc = useCallback(async () => {
    try {
      const res = await api.get(`/user/details/${user.user_id}`);
      const details = res.data?.data;
      const status = details?.tailor_profile?.verification_status;
      if (status) {
        setKycStatus(status);
        localStorage.setItem('user', JSON.stringify({ ...user, kyc_status: status }));
      }
      setProfile(details);
      setProfileForm({
        shop_name: details?.tailor_profile?.shop_name || '',
        bio: details?.tailor_profile?.bio || '',
        years_of_experience: String(details?.tailor_profile?.years_of_experience ?? ''),
      });
    } catch {
      /* keep cached status */
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      navigate('/login', { replace: true });
      return;
    }
    refreshKyc();
  }, []);

  const fetchAvailable = async () => {
    setAvailableLoading(true);
    try {
      const res = await api.get('/orders/tailor/available');
      setAvailable(res.data?.data?.data || res.data?.data);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message;
      if (err.response?.status === 403) setAvailable({ kyc_blocked: true, message: msg });
    } finally {
      setAvailableLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get(`/orders/history/${user.user_id}?limit=100`);
      const orders = res.data?.data?.orders || [];
      setMyOrders(orders.filter((o: any) => ACTIVE_STATUSES.includes(o.order_status)));
      setHistoryOrders(orders);
    } catch {
      /* noop */
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await api.get('/ratings/tailor/mine');
      setFeedback(res.data?.data?.data || res.data?.data);
    } catch {
      /* noop */
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/user/tailor/documents');
      const data = res.data?.data?.data || res.data?.data;
      setDocuments(data?.documents || []);
      if (data?.kyc_status) setKycStatus(data.kyc_status);
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    if (activeTab === 'available') fetchAvailable();
    if (activeTab === 'orders' || activeTab === 'history') fetchMyOrders();
    if (activeTab === 'feedback') fetchFeedback();
    if (activeTab === 'profile') fetchDocuments();
  }, [activeTab]);

  const acceptOrder = async (orderId: number) => {
    setActioning(orderId);
    try {
      await api.post(`/orders/${orderId}/accept`);
      showBanner('success', `Order #${orderId} accepted`);
      fetchAvailable();
    } catch (err: any) {
      showBanner('error', err.response?.data?.error?.message || 'Could not accept order');
    } finally {
      setActioning(null);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    setActioning(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      showBanner('success', `Order #${orderId} updated`);
      fetchMyOrders();
    } catch (err: any) {
      showBanner('error', err.response?.data?.error?.message || 'Could not update status');
    } finally {
      setActioning(null);
    }
  };

  const uploadDocuments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const f of Array.from(files)) {
      const err = validateImageFile(f);
      if (err) {
        showBanner('error', err);
        return;
      }
    }
    setDocUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append('documents', f);
      await api.post('/user/tailor/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showBanner('success', 'Documents submitted for review');
      fetchDocuments();
      refreshKyc();
    } catch (err: any) {
      showBanner('error', err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setDocUploading(false);
    }
  };

  const uploadProfilePicture = async (file: File | null) => {
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      showBanner('error', err);
      return;
    }
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post('/user/me/profile-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showBanner('success', 'Profile picture updated');
      refreshKyc();
    } catch (e: any) {
      showBanner('error', e.response?.data?.error?.message || 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      await api.put(`/user/details/${user.user_id}`, {
        shop_name: profileForm.shop_name || undefined,
        bio: profileForm.bio,
        years_of_experience: Number(profileForm.years_of_experience) || undefined,
      });
      showBanner('success', 'Profile updated');
      setProfileEditing(false);
      refreshKyc();
    } catch (e: any) {
      showBanner('error', e.response?.data?.error?.message || 'Update failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const kycApproved = kycStatus === 'approved';

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'available', label: 'Available', icon: Package },
    { key: 'orders', label: 'My Orders', icon: Scissors },
    { key: 'history', label: 'History', icon: ClipboardList },
    { key: 'feedback', label: 'Feedback', icon: Star },
    { key: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="StitchUp" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="font-semibold text-gray-900 leading-tight">Tailor Dashboard</h1>
              <p className="text-xs text-gray-400">{user.first_name || 'Tailor'}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                activeTab === t.key ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Banner */}
        {banner.text && (
          <div
            className={cn(
              'px-4 py-3 rounded-xl text-sm flex items-center gap-2',
              banner.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700',
            )}
          >
            {banner.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {banner.text}
          </div>
        )}

        {/* KYC status banner */}
        {kycStatus === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">KYC verification in progress</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Our team is reviewing your documents — this usually takes <strong>24-48 hours</strong>. You'll be able to accept orders once approved.
              </p>
            </div>
          </div>
        )}
        {kycStatus === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">KYC verification failed</p>
              <p className="text-xs text-red-700 mt-0.5">
                Please check the rejection reason in the Profile tab and re-submit valid documents.
              </p>
            </div>
          </div>
        )}

        {/* ─── Available orders ─── */}
        {activeTab === 'available' && (
          <div>
            {availableLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-teal-600" size={28} /></div>
            ) : !kycApproved ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
                Orders become visible once your KYC is approved.
              </div>
            ) : (
              <>
                {available && (
                  <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 mb-4">
                    <p className="text-sm text-gray-600">
                      Active orders: <strong>{available.active_orders}</strong> / {available.max_active_orders}
                    </p>
                    {!available.can_accept && (
                      <span className="text-xs text-amber-600 font-medium">Limit reached — finish an order to accept more</span>
                    )}
                  </div>
                )}
                {(available?.orders || []).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
                    No orders available right now. Check back soon!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {available.orders.map((o: any) => (
                      <div key={o.order_id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">#{o.order_id} — {o.items_summary || 'Order'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due {o.delivery_date} · {o.city || '—'} · <span className="inline-flex items-center"><IndianRupee size={10} />{o.final_amount}</span>
                            {o.urgency_level !== 'normal' && <span className="ml-2 text-orange-600 font-medium">{o.urgency_level}</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => acceptOrder(o.order_id)}
                          disabled={!available.can_accept || actioning === o.order_id}
                          className="shrink-0 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          {actioning === o.order_id && <Loader2 size={14} className="animate-spin" />}
                          Accept
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── My active orders ─── */}
        {activeTab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-teal-600" size={28} /></div>
            ) : myOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
                No active orders. Accept one from the Available tab.
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((o) => {
                  const action = NEXT_ACTION[o.order_status];
                  return (
                    <div key={o.order_id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">#{o.order_id} — {o.items_summary || 'Order'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due {o.delivery_date} · <span className="inline-flex items-center"><IndianRupee size={10} />{o.final_amount}</span>
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">
                          {TAILOR_STATUS_LABELS[o.order_status] || o.order_status}
                        </span>
                      </div>
                      {action && (
                        <button
                          onClick={() => updateStatus(o.order_id, action.next)}
                          disabled={actioning === o.order_id}
                          className="mt-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          {actioning === o.order_id && <Loader2 size={14} className="animate-spin" />}
                          {action.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── History ─── */}
        {activeTab === 'history' && (
          <div>
            {ordersLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-teal-600" size={28} /></div>
            ) : historyOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
                No orders yet.
              </div>
            ) : (
              <div className="space-y-3">
                {historyOrders.map((o) => (
                  <div key={o.order_id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm">#{o.order_id} — {o.items_summary || 'Order'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Placed {new Date(o.created_at).toLocaleDateString()} · <span className="inline-flex items-center"><IndianRupee size={10} />{o.final_amount}</span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 text-xs font-medium px-2.5 py-1 rounded-full',
                        o.order_status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : o.order_status === 'cancelled'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-teal-50 text-teal-700',
                      )}
                    >
                      {TAILOR_STATUS_LABELS[o.order_status] || o.order_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Feedback ─── */}
        {activeTab === 'feedback' && (
          <div>
            {feedbackLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-teal-600" size={28} /></div>
            ) : !feedback || feedback.total_reviews === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
                No customer feedback yet.
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 mb-4 flex items-center gap-3">
                  <Star size={20} className="text-amber-400 fill-amber-400" />
                  <p className="text-sm text-gray-700">
                    <strong className="text-lg">{feedback.average_rating}</strong> / 5 · {feedback.total_reviews} review{feedback.total_reviews !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-3">
                  {feedback.reviews.map((r: any) => (
                    <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{r.reviewer_name}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={13} className={i < r.overall_rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                          ))}
                        </div>
                      </div>
                      {r.review_title && <p className="text-sm font-medium text-gray-700">{r.review_title}</p>}
                      {r.review_text && <p className="text-sm text-gray-500 mt-1">{r.review_text}</p>}
                      <p className="text-xs text-gray-400 mt-2">Order #{r.order_id} · {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Profile + KYC documents ─── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Profile</h2>
                {!profileEditing ? (
                  <button onClick={() => setProfileEditing(true)} className="flex items-center gap-1 text-sm text-teal-700 hover:underline">
                    <Pencil size={14} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setProfileEditing(false)} className="flex items-center gap-1 text-sm text-gray-500">
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={saveProfile} disabled={profileSaving} className="flex items-center gap-1 text-sm text-teal-700 font-medium">
                      {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  {profile?.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                      <UserCircle size={32} className="text-teal-600" />
                    </div>
                  )}
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-800">
                    {photoUploading ? <Loader2 size={12} className="animate-spin text-white" /> : <Pencil size={11} className="text-white" />}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={(e) => { uploadProfilePicture(e.target.files?.[0] || null); e.target.value = ''; }}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                  <span
                    className={cn(
                      'inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full',
                      kycApproved ? 'bg-green-50 text-green-700' : kycStatus === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700',
                    )}
                  >
                    KYC: {kycStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Shop name</label>
                  {profileEditing ? (
                    <input
                      value={profileForm.shop_name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, shop_name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  ) : (
                    <p className="text-sm text-gray-800">{profile?.tailor_profile?.shop_name || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Years of experience</label>
                  {profileEditing ? (
                    <input
                      value={profileForm.years_of_experience}
                      onChange={(e) => setProfileForm((p) => ({ ...p, years_of_experience: e.target.value.replace(/\D/g, '') }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  ) : (
                    <p className="text-sm text-gray-800">{profile?.tailor_profile?.years_of_experience ?? '—'}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                  {profileEditing ? (
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-800">{profile?.tailor_profile?.bio || '—'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* KYC documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">KYC Documents</h2>
              {documents.length > 0 && (
                <div className="space-y-2 mb-4">
                  {documents.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2.5">
                      <FileText size={16} className="text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 capitalize">{d.type.replace(/_/g, ' ')}</p>
                        {d.rejection_reason && <p className="text-xs text-red-500">{d.rejection_reason}</p>}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
                          d.status === 'verified' ? 'bg-green-50 text-green-700' : d.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700',
                        )}
                      >
                        {d.status}
                      </span>
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 hover:underline shrink-0">
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-xl py-5 cursor-pointer transition-colors">
                {docUploading ? <Loader2 size={16} className="animate-spin text-teal-600" /> : <Upload size={16} className="text-gray-400" />}
                <span className="text-sm text-gray-500">{docUploading ? 'Uploading…' : 'Submit more documents'}</span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={(e) => { uploadDocuments(e.target.files); e.target.value = ''; }}
                />
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
