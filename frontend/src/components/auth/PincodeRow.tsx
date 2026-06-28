import { Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { FieldErrors } from '@/lib/validate';

interface PincodeRowProps {
  form: Record<string, string>;
  set: (field: string, value: string) => void;
  fieldErrors: FieldErrors;
  pincodeLoading: boolean;
  pincodeDistrict: string;
}

export function PincodeRow({ form, set, fieldErrors, pincodeLoading, pincodeDistrict }: PincodeRowProps) {
  return (
    <>
      <div>
        <div className="relative">
          <Input
            label="PIN Code"
            value={form.postal_code}
            onChange={(v) => set('postal_code', v.replace(/\D/g, '').slice(0, 6))}
            error={fieldErrors.postal_code}
            placeholder="400001"
            maxLength={6}
          />
          {pincodeLoading && (
            <Loader2 size={16} className="absolute right-3 top-9 animate-spin text-teal-500" />
          )}
        </div>
        {pincodeDistrict && (
          <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
            <MapPin size={12} /> {pincodeDistrict}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={form.city} onChange={(v) => set('city', v)} error={fieldErrors.city} disabled={pincodeLoading} />
        <Input label="State" value={form.state} onChange={(v) => set('state', v)} error={fieldErrors.state} disabled={pincodeLoading} />
      </div>
    </>
  );
}
