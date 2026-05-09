import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  IndianRupee,
  Ruler,
  Shirt,
  Mic,
  MapPin,
  Phone,
  Mail,
  Truck,
  PackageOpen,
  Clock,
  CheckCircle2,
  MessageSquare,
  Star,
  Camera,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import api from '@/services/api';

const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  created: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
  awaiting_material: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
  material_received: { bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-200' },
  tailor_assigned: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  cutting_started: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200' },
  stitching_in_progress: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200' },
  final_touch: { bg: 'bg-pink-50', text: 'text-pink-700', ring: 'ring-pink-200' },
  ready_for_collection: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
};

const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  // Rating state
  const [existingRating, setExistingRating] = useState<any>(null);
  const [ratingLoaded, setRatingLoaded] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [wantSharePhoto, setWantSharePhoto] = useState<boolean | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setData(res.data?.data || res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order details');
      }
      setLoading(false);
    })();
  }, [orderId]);

  // Fetch existing rating
  useEffect(() => {
    if (!orderId) return;
    api.get(`/ratings/order/${orderId}`).then((res) => {
      const r = res.data?.data || res.data;
      if (r) setExistingRating(r);
      setRatingLoaded(true);
    }).catch(() => setRatingLoaded(true));
  }, [orderId]);

  const handlePhotoUpload = async (file: File) => {
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPhotoUrl(res.data?.data?.url || res.data?.url || '');
    } catch {}
    setPhotoUploading(false);
  };

  const handleSubmitRating = async () => {
    if (!overallRating) return;
    setRatingSubmitting(true);
    try {
      await api.post('/ratings', {
        order_id: Number(orderId),
        overall_rating: overallRating,
        quality_rating: qualityRating || undefined,
        timeliness_rating: timelinessRating || undefined,
        review_text: reviewText || undefined,
        photos_url: photoUrl ? [photoUrl] : undefined,
        share_photo_publicly: wantSharePhoto === true,
      });
      setRatingSuccess(true);
    } catch {}
    setRatingSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <AlertTriangle size={40} className="text-red-400 mb-3" />
        <p className="text-sm text-red-600 mb-4">{error || 'Order not found'}</p>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-teal-600 font-medium underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const order = data.order;
  const items = data.items || [];
  const pricing = data.pricing || {};
  const address = data.delivery_address;
  const contact = data.contact;
  const measurementDetails = data.measurement_details;
  const statusHistory = data.status_history || [];
  const sc = STATUS_COLORS[order.order_status] || { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <p className="text-sm font-medium text-gray-700">Order #{order.order_id}</p>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Status Badge */}
        <div className={cn('rounded-2xl p-5 ring-1', sc.bg, sc.ring)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-medium text-gray-400">Current Status</p>
              <p className={cn('text-lg font-bold mt-0.5', sc.text)}>{formatStatus(order.order_status)}</p>
            </div>
            <CheckCircle2 size={28} className={sc.text} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Items */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-3">Items</p>
          {items.length > 0 ? items.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.template_type?.name || 'Item'}</p>
                {item.template_sub_type?.name && (
                  <p className="text-xs text-gray-400">{item.template_sub_type.name}</p>
                )}
              </div>
              <span className="flex items-center text-sm font-semibold text-teal-700">
                <IndianRupee size={12} />{Number(item.item_final_cost).toLocaleString('en-IN')}
              </span>
            </div>
          )) : (
            <p className="text-sm text-gray-400">No item details available</p>
          )}
        </div>

        {/* Measurement Details */}
        {measurementDetails && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase font-medium text-gray-400 mb-3">Measurements</p>
            <div className="flex items-center gap-2 mb-2">
              {measurementDetails.method === 'manual_measurements' ? (
                <>
                  <Ruler size={14} className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">Manual Measurements</span>
                </>
              ) : (
                <>
                  <Shirt size={14} className="text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">Reference Clothing</span>
                </>
              )}
            </div>
            {measurementDetails.measurement_audio_url && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mic size={12} className="text-teal-600" />
                  <span className="text-xs font-medium text-gray-500">Measurement Audio Note</span>
                </div>
                <audio src={measurementDetails.measurement_audio_url} controls className="w-full h-10" />
              </div>
            )}
          </div>
        )}

        {/* Special Instructions */}
        {(data.special_instructions || data.special_instructions_audio_url) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-teal-600" />
              <p className="text-xs uppercase font-medium text-gray-400">Special Instructions</p>
            </div>
            {data.special_instructions && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.special_instructions}</p>
            )}
            {data.special_instructions_audio_url && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mic size={12} className="text-teal-600" />
                  <span className="text-xs font-medium text-gray-500">Audio Note</span>
                </div>
                <audio src={data.special_instructions_audio_url} controls className="w-full h-10" />
              </div>
            )}
          </div>
        )}

        {/* Delivery Address */}
        {address && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-teal-600" />
              <p className="text-xs uppercase font-medium text-gray-400">Delivery Address</p>
            </div>
            <p className="text-sm text-gray-700">
              {[address.flat_number, address.address_line1].filter(Boolean).join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              {[address.city, address.state].filter(Boolean).join(', ')} {address.postal_code && `— ${address.postal_code}`}
            </p>
            {contact && (
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {contact.phone && (
                  <span className="flex items-center gap-1"><Phone size={10} /> {contact.phone}</span>
                )}
                {contact.email && (
                  <span className="flex items-center gap-1"><Mail size={10} /> {contact.email}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Delivery Method */}
        {data.delivery_method && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase font-medium text-gray-400 mb-2">Material Delivery</p>
            {data.delivery_method === 'pickup' ? (
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Truck size={14} className="text-teal-600" /> Pickup by our delivery
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <PackageOpen size={14} className="text-teal-600" /> Self Parcel
              </p>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-4">
          <p className="text-xs uppercase font-medium text-teal-600 mb-3">Price Summary</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Stitching</span>
              <span className="text-gray-800 font-medium flex items-center">
                <IndianRupee size={12} />{Number(pricing.total_cost).toLocaleString('en-IN')}
              </span>
            </div>
            {Number(data.pickup_fee) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pickup fee</span>
                <span className="text-gray-800 font-medium flex items-center">
                  <IndianRupee size={12} />{Number(data.pickup_fee).toLocaleString('en-IN')}
                </span>
              </div>
            )}
            {Number(pricing.discount_amount) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600 font-medium flex items-center">
                  -<IndianRupee size={12} />{Number(pricing.discount_amount).toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="border-t border-teal-200 pt-1.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Total Paid</p>
              <span className="flex items-center text-xl font-bold text-teal-700">
                <IndianRupee size={17} />{Number(pricing.final_amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        {statusHistory.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-teal-600" />
              <p className="text-xs uppercase font-medium text-gray-400">Status History</p>
            </div>
            <div className="space-y-0">
              {statusHistory.map((h: any, i: number) => {
                const hsc = STATUS_COLORS[h.status] || { bg: 'bg-gray-50', text: 'text-gray-700', ring: '' };
                const isLast = i === statusHistory.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn('w-3 h-3 rounded-full mt-1 ring-2 ring-white', isLast ? 'bg-teal-500' : 'bg-gray-300')} />
                      {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-0.5" />}
                    </div>
                    <div className="pb-4">
                      <p className={cn('text-sm font-medium', hsc.text)}>{formatStatus(h.status)}</p>
                      {h.notes && <p className="text-xs text-gray-500 mt-0.5">{h.notes}</p>}
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(h.changed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rating & Review Section (only for completed orders) */}
        {order.order_status === 'completed' && ratingLoaded && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} className="text-amber-500" />
              <p className="text-sm font-semibold text-gray-800">Rate Your Order</p>
            </div>

            {/* Already rated */}
            {(existingRating || ratingSuccess) ? (
              <div className="text-center py-4">
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={24} className={s <= (existingRating?.overall_rating || overallRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
                <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} /> Thank you for your review!
                </p>
                {existingRating?.review_text && (
                  <p className="text-xs text-gray-500 mt-2 italic">"{existingRating.review_text}"</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall Rating */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Overall Experience</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setOverallRating(s)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star size={28} className={s <= overallRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 hover:text-amber-200'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-ratings */}
                {overallRating > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 mb-1">Quality</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setQualityRating(s)}>
                            <Star size={18} className={s <= qualityRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 mb-1">Timeliness</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setTimelinessRating(s)}>
                            <Star size={18} className={s <= timelinessRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Review text */}
                {overallRating > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Write a review (optional)</p>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      placeholder="Tell us about your experience..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                    />
                  </div>
                )}

                {/* Photo sharing prompt */}
                {overallRating > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                      <Camera size={16} /> Would you like to share a photo wearing it?
                    </p>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setWantSharePhoto(true)}
                        className={cn(
                          'px-4 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                          wantSharePhoto === true ? 'bg-amber-100 border-amber-400 text-amber-800' : 'border-gray-200 text-gray-600 hover:border-amber-300',
                        )}
                      >
                        Yes, I'd love to!
                      </button>
                      <button
                        type="button"
                        onClick={() => setWantSharePhoto(false)}
                        className={cn(
                          'px-4 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                          wantSharePhoto === false ? 'bg-gray-100 border-gray-400 text-gray-700' : 'border-gray-200 text-gray-600 hover:border-gray-300',
                        )}
                      >
                        Maybe later
                      </button>
                    </div>
                    {wantSharePhoto === true && (
                      <div className="mt-3">
                        {photoUrl ? (
                          <div className="flex items-center gap-2 text-xs text-green-700">
                            <CheckCircle2 size={14} /> Photo uploaded!
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-xl py-4 cursor-pointer transition-colors">
                            {photoUploading ? (
                              <Loader2 size={16} className="animate-spin text-amber-500" />
                            ) : (
                              <Camera size={16} className="text-amber-500" />
                            )}
                            <span className="text-xs text-amber-700">{photoUploading ? 'Uploading...' : 'Upload a photo'}</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit button */}
                {overallRating > 0 && (
                  <button
                    type="button"
                    onClick={handleSubmitRating}
                    disabled={ratingSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:bg-teal-400"
                  >
                    {ratingSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Submit Review
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
