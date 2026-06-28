import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
  showIcon?: boolean;
}

export function ErrorMessage({ message, className = '', showIcon = false }: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2 ${className}`}>
      {showIcon && <AlertCircle size={16} />}
      {message}
    </div>
  );
}
