import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Star,
  X,
} from 'lucide-react';
import { supportService } from '@/services/support';
import { cn } from '@/lib/cn';

export default function SupportFeedback() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    subject: '',
    description: '',
    email: user.email || '',
    phone_number: user.phone_number || '',
    order_id: '',
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const isValid =
    form.subject.trim() &&
    form.description.trim() &&
    form.email.trim() &&
    /^[6-9]\d{9}$/.test(form.phone_number) &&
    attachment;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const description = rating > 0
        ? `[Rating: ${rating}/5]\n\n${form.description}`
        : form.description;

      const res = await supportService.createTicket(
        {
          ticket_type: 'other',
          subject: `[Feedback] ${form.subject}`,
          description,
          email: form.email,
          phone_number: form.phone_number,
          order_id: form.order_id ? Number(form.order_id) : undefined,
          priority: 'low',
        },
        attachment || undefined,
      );
      const ticketId = res.data?.data?.ticket_id;
      setSuccess(`Feedback #${ticketId} submitted! Thank you for helping us improve.`);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to submit feedback. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <CheckCircle2 size={48} className="text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Feedback Submitted</h2>
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
          <p className="text-sm font-medium text-gray-700">Share Feedback</p>
          <div className="w-16" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How was your overall experience?
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                  className={
                    (hoverRating || rating) >= star ? 'text-amber-400' : 'text-gray-300'
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-500 ml-2">{rating}/5</span>
            )}
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
            placeholder="e.g. Great stitching quality, Suggestion for improvement"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Order ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Order ID <span className="text-gray-400 text-xs">(if related to a specific order)</span>
          </label>
          <input
            type="text"
            value={form.order_id}
            onChange={(e) => set('order_id', e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 42"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your Feedback <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Tell us what went well, what could be improved, or any suggestions you have..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/2000</p>
        </div>

        {/* Attachment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Attachment <span className="text-red-400">*</span>
          </label>
          {attachment ? (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <Upload size={16} className="text-blue-600" />
              <span className="text-sm text-blue-800 flex-1 truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl py-6 cursor-pointer transition-colors">
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload a photo or document</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
            </label>
          )}
          <p className="text-xs text-gray-400 mt-1">Max 5MB — JPEG, PNG, WebP, or PDF</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={cn(
            'w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
            isValid && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
