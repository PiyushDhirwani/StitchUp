export interface UserOrder {
  order_id: number;
  order_status: string;
  items_summary: string;
  final_amount: number;
  delivery_date: string;
  created_at: string;
}

export const TICKET_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-blue-50', text: 'text-blue-700' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700' },
  waiting_for_customer: { bg: 'bg-orange-50', text: 'text-orange-700' },
  waiting_for_tailor: { bg: 'bg-purple-50', text: 'text-purple-700' },
  resolved: { bg: 'bg-green-50', text: 'text-green-700' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
};
