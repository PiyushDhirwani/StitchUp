import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmptyOrdersState() {
  const navigate = useNavigate();
  return (
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
  );
}
