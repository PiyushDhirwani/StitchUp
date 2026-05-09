import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Loader2,
  Gift,
  Zap,
  Calendar,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Shirt,
  Info,
} from 'lucide-react';
import { templateService, type Template } from '@/services/templates';
import { cn } from '@/lib/cn';
import api from '@/services/api';

// Fixed express pricing tiers (on top of base price)
const EXPRESS_TIERS = [
  { days: 3, label: '3 Days', surcharge: 500, description: 'Standard Express' },
  { days: 5, label: '5 Days', surcharge: 300, description: 'Quick Delivery' },
  { days: 7, label: '7 Days', surcharge: 150, description: 'Priority' },
];

export default function ExpressOrder() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedTier, setSelectedTier] = useState<typeof EXPRESS_TIERS[0] | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isGift, setIsGift] = useState(false);

  // Submission
  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);

  useEffect(() => {
    templateService
      .getAll()
      .then((res) => setTemplates(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const basePrice = selectedTemplate
    ? Number(selectedTemplate.template_type.base_price || 800)
    : 0;
  const surcharge = selectedTier?.surcharge || 0;
  const totalAmount = basePrice + surcharge;

  const minDeliveryDate = new Date();
  minDeliveryDate.setDate(minDeliveryDate.getDate() + 3);

  const canSubmit = selectedTemplate && selectedTier && (!isGift || recipientName.trim());

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;
    setPlacing(true);
    setPayError('');

    try {
      // Create Razorpay order
      const { data: orderData } = await api.post('/payments/create-order', {
        template_type_id: selectedTemplate!.template_type.id,
        amount: totalAmount,
      });
      const { razorpay_order_id, amount, currency, key_id } = orderData.data || orderData;

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + selectedTier!.days);

      const options: any = {
        key: key_id,
        amount,
        currency,
        name: 'StitchUp',
        description: `Express Order — ${selectedTemplate!.template_type.type_name}`,
        order_id: razorpay_order_id,
        prefill: { name: `${user.first_name || ''} ${user.last_name || ''}`.trim(), email: user.email, contact: user.phone_number },
        theme: { color: '#0d9488' },
        handler: async (response: any) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              template_type_id: selectedTemplate!.template_type.id,
              measurement_method: 'reference_clothing',
              special_instructions: `[EXPRESS - ${selectedTier!.days} DAY]${isGift ? ` [GIFT for: ${recipientName}]` : ''} ${specialInstructions}`.trim(),
              delivery_method: 'self_parcel',
              delivery_flat_number: '',
              delivery_address_line1: 'Express — Material to be delivered to workshop',
              delivery_city: '',
              delivery_state: '',
              delivery_postal_code: '',
              contact_phone: user.phone_number || '',
              contact_email: user.email || '',
              pickup_fee: surcharge,
            });
            const orderId = verifyRes.data?.data?.order_id || verifyRes.data?.order_id;
            setConfirmedOrderId(orderId || null);
            setSuccess(true);
          } catch {
            setPayError('Payment verified but order creation failed. Please contact support.');
          }
          setPlacing(false);
        },
        modal: {
          ondismiss: () => { setPlacing(false); },
        },
      };
      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      setPayError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to initiate payment.');
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Express Order Placed!</h2>
          <p className="text-sm text-gray-500 mb-1">Your {selectedTier!.days}-day express order has been confirmed.</p>
          {confirmedOrderId && (
            <p className="text-sm text-teal-700 font-medium mb-4">Order ID: #{confirmedOrderId}</p>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
            <p className="text-sm font-medium text-amber-800 mb-1 flex items-center gap-1.5">
              <AlertCircle size={14} /> Important
            </p>
            <p className="text-xs text-amber-700">
              Please deliver your raw material to the workshop <strong>by end of today</strong>. 
              Your {selectedTier!.days}-day delivery countdown starts once material is received.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => confirmedOrderId ? navigate(`/orders/${confirmedOrderId}`) : navigate('/dashboard')}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors"
            >
              Check Order Status
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={18} /> Dashboard
          </button>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" /> Express / Gift Order
          </p>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-semibold text-sm">How Express Orders Work</p>
              <p>• Choose your template and desired delivery speed</p>
              <p>• Deliver raw material to the workshop <strong>by end of today</strong></p>
              <p>• Minimum delivery: 3 days from material received</p>
              <p>• Express surcharge applies based on speed</p>
            </div>
          </div>
        </div>

        {/* Gift toggle */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <button
            type="button"
            onClick={() => setIsGift(!isGift)}
            className={cn(
              'flex items-center gap-3 w-full text-left rounded-xl p-3 border-2 transition-all',
              isGift ? 'border-pink-400 bg-pink-50' : 'border-gray-200 hover:border-pink-200',
            )}
          >
            <Gift size={20} className={isGift ? 'text-pink-500' : 'text-gray-400'} />
            <div>
              <p className="text-sm font-medium text-gray-800">This is a gift for someone</p>
              <p className="text-xs text-gray-500">We'll add special care to the packaging</p>
            </div>
          </button>
          {isGift && (
            <div className="mt-3">
              <label className="text-xs text-gray-500 mb-1 block">Recipient's Name</label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who is this for?"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-3 flex items-center gap-1.5">
            <Shirt size={14} /> Select Template
          </p>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-teal-600" size={24} /></div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.template_type.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t)}
                  className={cn(
                    'text-left p-3 rounded-xl border-2 transition-all',
                    selectedTemplate?.template_type.id === t.template_type.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-100 hover:border-teal-200',
                  )}
                >
                  <p className="text-sm font-medium text-gray-800">{t.template_type.type_name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{t.template_type.category}</p>
                  {(t as any).pricing?.[0] && (
                    <p className="text-xs font-semibold text-teal-700 mt-1 flex items-center">
                      <IndianRupee size={10} />{Number((t as any).pricing[0].base_price).toLocaleString('en-IN')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Speed Selection */}
        {selectedTemplate && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs uppercase font-medium text-gray-400 mb-3 flex items-center gap-1.5">
              <Calendar size={14} /> Delivery Speed
            </p>
            <div className="space-y-2">
              {EXPRESS_TIERS.map((tier) => {
                const deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + tier.days);
                return (
                  <button
                    key={tier.days}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      'w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left',
                      selectedTier?.days === tier.days
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-100 hover:border-teal-200',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                        <Zap size={12} className={tier.days === 3 ? 'text-red-500' : tier.days === 5 ? 'text-amber-500' : 'text-blue-500'} />
                        {tier.description}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Ready by {deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-teal-700 flex items-center">
                        +<IndianRupee size={11} />{tier.surcharge.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-gray-400">{tier.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {selectedTemplate && selectedTier && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-xs text-gray-500 mb-1.5 block">Special Instructions / Style Notes (optional)</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              placeholder="Describe the style, fit, or any special requirements..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Pricing Summary */}
        {selectedTemplate && selectedTier && (
          <div className="bg-teal-50 rounded-2xl border border-teal-200 p-4">
            <p className="text-xs uppercase font-medium text-teal-600 mb-2">Pricing Summary</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Base price ({selectedTemplate.template_type.type_name})</span>
                <span className="flex items-center"><IndianRupee size={12} />{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Express surcharge ({selectedTier.label})</span>
                <span className="flex items-center"><IndianRupee size={12} />{surcharge.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-teal-200 pt-1.5 flex justify-between font-bold text-teal-800">
                <span>Total</span>
                <span className="flex items-center text-lg"><IndianRupee size={14} />{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {payError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} /> {payError}
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      {selectedTemplate && selectedTier && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur border-t border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              <p className="font-medium text-gray-700">{selectedTemplate.template_type.type_name} • {selectedTier.label}</p>
              <p>Material drop-off: Today</p>
            </div>
            <button
              type="button"
              disabled={!canSubmit || placing}
              onClick={handlePlaceOrder}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:bg-teal-400"
            >
              {placing ? <Loader2 size={16} className="animate-spin" /> : <IndianRupee size={14} />}
              {placing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
