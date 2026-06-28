import { ChevronRight, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { STATUS_COLORS, formatStatus } from '@/types/order.types';
import type { OrderSummary } from '@/types/order.types';

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate();
  const sc = STATUS_COLORS[order.order_status] || { bg: 'bg-gray-50', text: 'text-gray-700' };

  return (
    <button
      type="button"
      onClick={() => navigate(`/orders/${order.order_id}`)}
      className="w-full bg-white rounded-2xl border border-gray-100 hover:border-gray-200 p-4 text-left transition-all hover:shadow-sm group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-gray-400">#{order.order_id}</span>
        <span className={cn('text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
          {formatStatus(order.order_status)}
        </span>
      </div>
      <p className="font-semibold text-gray-800 text-sm">{order.items_summary || 'Order'}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="flex items-center text-sm font-bold text-teal-700">
          <IndianRupee size={13} />{Number(order.final_amount).toLocaleString('en-IN')}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      <div className="flex items-center justify-end mt-1">
        <span className="text-xs text-gray-400 group-hover:text-teal-600 flex items-center gap-0.5 transition-colors">
          View details <ChevronRight size={12} />
        </span>
      </div>
    </button>
  );
}
