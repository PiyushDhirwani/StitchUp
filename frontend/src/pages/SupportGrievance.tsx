import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
} from 'lucide-react';
import { supportService } from '@/services/support';
import { cn } from '@/lib/cn';
import { IMAGE_UPLOAD, validateImageFile } from '@/lib/validate';
import api from '@/services/api';

const TICKET_TYPES = [
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'delay', label: 'Delay' },
  { value: 'miscommunication', label: 'Miscommunication' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'material_issue', label: 'Material Issue' },
  { value: 'measurement_issue', label: 'Measurement Issue' },
  { value: 'refund_request', label: 'Refund Request' },
  { value: 'other', label: 'Other' },
];

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

interface UserOrder {
  order_id: number;
  order_status: string;
  items_summary: string;
  final_amount: number;
  delivery_date: string;
  created_at: string;
}

export default function SupportGrievance() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    ticket_type: '',
    subject: '',
    description: '',
    email: user.email || '',
    phone_number: user.phone_number || '',
    order_id: '',
    priority: 'medium',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Orders for dropdown
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderWarning, setOrderWarning] = useState('');

  useEffect(() => {
    if (user.user_id) {
      api.get(`/orders/history/${user.user_id}?limit=100`)
        .then((res) => {
          const orders = res.data?.data?.orders || res.data?.orders || [];
          setUserOrders(orders);
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    } else {
      setOrdersLoading(false);
    }
  }, []);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleOrderSelect = (orderId: string) => {
    set('order_id', orderId);
    setOrderWarning('');
    if (!orderId) return;
    const order = userOrders.find((o) => String(o.order_id) === orderId);
    if (order && order.delivery_date) {
      const deliveredAt = new Date(order.delivery_date).getTime();
      const now = Date.now();
      if (now - deliveredAt < TWO_WEEKS_MS) {
        const daysLeft = Math.ceil((TWO_WEEKS_MS - (now - deliveredAt)) / (24 * 60 * 60 * 1000));
        setOrderWarning(
          `This order was delivered less than 2 weeks ago. You can raise a grievance in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`,
        );
      }
    }
  };

  const isValid =
    form.ticket_type &&
    form.subject.trim() &&
    form.description.trim() &&
    form.email.trim() &&
    /^[6-9]\d{9}$/.test(form.phone_number) &&
    attachment &&
    !orderWarning;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const res = await supportService.createTicket(
        {
          ticket_type: form.ticket_type,
          subject: form.subject,
          description: form.description,
          email: form.email,
          phone_number: form.phone_number,
          order_id: form.order_id ? Number(form.order_id) : undefined,
          priority: form.priority,
        },
        attachment || undefined,
      );
      const ticketId = res.data?.data?.ticket_id;
      setSuccess(`Ticket #${ticketId} created successfully! A confirmation email has been sent.`);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to submit ticket. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <CheckCircle2 size={48} className="text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Grievance Submitted</h2>
          <p className="text-sm text-gray-600 mb-6">{success}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={18} /> Dashboard
          </button>
          <p className="text-sm font-medium text-gray-700">Raise Grievance</p>
          <div className="w-16" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Issue Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Issue Type <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TICKET_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('ticket_type', t.value)}
                className={cn(
                  'text-xs font-medium px-3 py-2.5 rounded-lg border-2 transition-all text-left',
                  form.ticket_type === t.value
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => set('subject', e.target.value)}
            maxLength={200}
            placeholder="Brief summary of your issue"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          />
        </div>

        {/* Contact info row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={form.phone_number}
              onChange={(e) => set('phone_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Order Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Related Order <span className="text-gray-400 text-xs">(if applicable)</span>
          </label>
          {ordersLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 size={14} className="animate-spin" /> Loading orders...
            </div>
          ) : userOrders.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No orders found</p>
          ) : (
            <select
              value={form.order_id}
              onChange={(e) => handleOrderSelect(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
            >
              <option value="">— Select an order (optional) —</option>
              {userOrders.map((o) => (
                <option key={o.order_id} value={o.order_id}>
                  #{o.order_id} — {o.items_summary || 'Order'} — ₹{Number(o.final_amount).toLocaleString('en-IN')} ({o.order_status.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          )}
          {orderWarning && (
            <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>{orderWarning}</span>
            </div>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Describe your issue in detail — what happened, when, and how it affected you..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/2000</p>
        </div>

        {/* Attachment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Attachment <span className="text-red-400">*</span>
          </label>
          {attachment ? (
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
              <Upload size={16} className="text-teal-600" />
              <span className="text-sm text-teal-800 flex-1 truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-teal-400 rounded-xl py-6 cursor-pointer transition-colors">
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload screenshot or document</span>
              <input
                type="file"
                className="hidden"
                accept={IMAGE_UPLOAD.ACCEPT}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const err = validateImageFile(file);
                    if (err) {
                      setError(err);
                      e.target.value = '';
                      return;
                    }
                  }
                  setError('');
                  setAttachment(file);
                }}
              />
            </label>
          )}
          <p className="text-xs text-gray-400 mt-1">{IMAGE_UPLOAD.LABEL}</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={cn(
            'w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
            isValid && !loading
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Submitting...' : 'Submit Grievance'}
        </button>
      </form>
    </div>
  );
}
