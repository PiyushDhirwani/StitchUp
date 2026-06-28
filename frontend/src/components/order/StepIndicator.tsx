import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { OrderStep } from '@/types/order.types';

const STEPS: { key: OrderStep; label: string }[] = [
  { key: 'template', label: 'Choose Template' },
  { key: 'details', label: 'Measurements & Details' },
  { key: 'review', label: 'Review & Pay' },
  { key: 'confirmed', label: 'Order Confirmed' },
];

interface StepIndicatorProps {
  stepIndex: number;
}

export function StepIndicator({ stepIndex }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
              i < stepIndex
                ? 'bg-teal-600 text-white'
                : i === stepIndex
                  ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500'
                  : 'bg-gray-100 text-gray-400',
            )}
          >
            {i < stepIndex ? <Check size={14} /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('w-10 h-0.5 mx-1', i < stepIndex ? 'bg-teal-500' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  );
}
