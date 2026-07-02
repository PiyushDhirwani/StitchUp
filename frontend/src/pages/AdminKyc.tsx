import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import api from '@/services/api';

type KycFilter = 'pending' | 'approved' | 'rejected';

export default function AdminKyc() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [filter, setFilter] = useState<KycFilter>('pending');
  const [tailors, setTailors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [banner, setBanner] = useState({ type: '' as 'success' | 'error' | '', text: '' });

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    if (!localStorage.getItem('auth_token') || user.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, []);

  const fetchTailors = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/tailors/kyc?status=${filter}`);
      const data = res.data?.data;
      setTailors(data?.data || data || []);
    } catch (err: any) {
      showBanner('error', err.response?.data?.error?.message || 'Failed to load tailors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTailors();
  }, [filter]);

  const review = async (tailorId: number, action: 'approve' | 'reject', reason?: string) => {
    setActioning(tailorId);
    try {
      await api.post(`/admin/tailors/${tailorId}/kyc`, { action, reason });
      showBanner('success', `Tailor ${action === 'approve' ? 'approved' : 'rejected'}`);
      setRejectingId(null);
      setRejectReason('');
      fetchTailors();
    } catch (err: any) {
      showBanner('error', err.response?.data?.error?.message || 'Action failed');
    } finally {
      setActioning(null);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-teal-700" />
            <div>
              <h1 className="font-semibold text-gray-900 leading-tight">Admin — Tailor KYC</h1>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
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

        {/* Filter */}
        <div className="flex rounded-xl bg-gray-100 p-1 w-fit">
          {(['pending', 'approved', 'rejected'] as KycFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all',
                filter === f ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-teal-600" size={28} /></div>
        ) : tailors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
            No {filter} tailors.
          </div>
        ) : (
          <div className="space-y-4">
            {tailors.map((t) => (
              <div key={t.tailor_id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start gap-4">
                  {t.profile_picture_url ? (
                    <img src={t.profile_picture_url} alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <UserCircle size={28} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{t.name || '—'}</p>
                    <p className="text-sm text-gray-500">{t.shop_name} · {t.city}, {t.state}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.email} · {t.phone_number} · Aadhaar {t.aadhar_number} · {t.years_of_experience ?? 0} yrs exp
                    </p>
                    <p className="text-xs text-gray-400">Registered {new Date(t.registered_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(t.documents || []).map((d: any) => (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-2 hover:border-teal-300 transition-colors"
                    >
                      <FileText size={15} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-700 capitalize flex-1 truncate">{d.type.replace(/_/g, ' ')}</span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          d.status === 'verified' ? 'bg-green-50 text-green-700' : d.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700',
                        )}
                      >
                        {d.status}
                      </span>
                    </a>
                  ))}
                  {(t.documents || []).length === 0 && (
                    <p className="text-xs text-gray-400 col-span-2">No documents submitted</p>
                  )}
                </div>

                {/* Actions */}
                {filter === 'pending' && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => review(t.tailor_id, 'approve')}
                      disabled={actioning === t.tailor_id}
                      className="bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {actioning === t.tailor_id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Approve KYC
                    </button>
                    <button
                      onClick={() => { setRejectingId(rejectingId === t.tailor_id ? null : t.tailor_id); setRejectReason(''); }}
                      className="border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
                {rejectingId === t.tailor_id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection (sent to the tailor)"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                    <button
                      onClick={() => review(t.tailor_id, 'reject', rejectReason)}
                      disabled={!rejectReason.trim() || actioning === t.tailor_id}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
