import { cn } from '@/lib/cn';

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  disabled,
}: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-500',
          error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-teal-500',
        )}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
