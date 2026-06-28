import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}

export function PageWrapper({ children, className = '', centered = false }: PageWrapperProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50',
        centered && 'flex items-center justify-center px-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
