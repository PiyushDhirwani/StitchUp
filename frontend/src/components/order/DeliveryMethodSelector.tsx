import { PackageOpen, Truck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ORDER_CONFIG } from '@/config/order.config';
import type { DeliveryMethod } from '@/types/order.types';

interface DeliveryMethodSelectorProps {
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (m: DeliveryMethod) => void;
}

export function DeliveryMethodSelector({ deliveryMethod, setDeliveryMethod }: DeliveryMethodSelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">How will you send your material/clothes?</h2>
      <p className="text-sm text-gray-500 mb-4">Choose how you'd like to provide your fabric or reference clothing to the tailor</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setDeliveryMethod('self_parcel')}
          className={cn(
            'rounded-xl border-2 p-4 text-left transition-all',
            deliveryMethod === 'self_parcel'
              ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300',
          )}
        >
          <PackageOpen size={20} className={deliveryMethod === 'self_parcel' ? 'text-teal-600' : 'text-gray-400'} />
          <p className="font-medium text-sm mt-2">Self Parcel (Free)</p>
          <p className="text-xs text-gray-500 mt-0.5">You courier/parcel the material to our address within {ORDER_CONFIG.PARCEL_DEADLINE_DAYS} days of placing the order</p>
        </button>
        <button
          type="button"
          onClick={() => setDeliveryMethod('pickup')}
          className={cn(
            'rounded-xl border-2 p-4 text-left transition-all',
            deliveryMethod === 'pickup'
              ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300',
          )}
        >
          <Truck size={20} className={deliveryMethod === 'pickup' ? 'text-teal-600' : 'text-gray-400'} />
          <p className="font-medium text-sm mt-2">Pickup by our delivery</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Our partner picks up from your address — <strong className="text-teal-700">₹{ORDER_CONFIG.PICKUP_FEE} extra</strong>
          </p>
        </button>
      </div>

      {deliveryMethod === 'self_parcel' && (
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Material must reach us within <strong>{ORDER_CONFIG.PARCEL_DEADLINE_DAYS} days</strong> of placing this order. If not received, the order will be <strong>auto-cancelled</strong> and payment refunded.
          </p>
        </div>
      )}
    </div>
  );
}
