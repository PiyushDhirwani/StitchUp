export type OrderStep = 'template' | 'details' | 'review' | 'confirmed';
export type MeasurementMethod = 'manual_measurements' | 'reference_clothing';
export type DeliveryMethod = 'pickup' | 'self_parcel';

export interface Measurements {
  height_cm: string;
  weight_kg: string;
  chest_cm: string;
  waist_cm: string;
  hips_cm: string;
  shoulder_width_cm: string;
  arm_length_cm: string;
  inseam_cm: string;
  neck_cm: string;
  back_length_cm: string;
}

export interface DeliveryAddress {
  flat_number: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface OrderSummary {
  order_id: number;
  order_status: string;
  consumer_id: number;
  tailor_id: number | null;
  tailor_name: string | null;
  number_of_items: number;
  final_amount: number;
  delivery_date: string;
  created_at: string;
  items_summary: string;
  status_updated_at: string;
}

export interface SupportTicket {
  id: number;
  subject: string;
  ticket_type: string;
  ticket_status: string;
  priority: string;
  order_id?: number;
  created_at: string;
  resolved_at?: string;
  description?: string;
  attachments?: string[];
  resolution_notes?: string;
  resolution_type?: string;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
  bio: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
}

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  created: { bg: 'bg-blue-50', text: 'text-blue-700' },
  awaiting_material: { bg: 'bg-amber-50', text: 'text-amber-700' },
  material_received: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  tailor_assigned: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  cutting_started: { bg: 'bg-purple-50', text: 'text-purple-700' },
  stitching_in_progress: { bg: 'bg-violet-50', text: 'text-violet-700' },
  final_touch: { bg: 'bg-pink-50', text: 'text-pink-700' },
  ready_for_collection: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  completed: { bg: 'bg-green-50', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
};

export const formatStatus = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
