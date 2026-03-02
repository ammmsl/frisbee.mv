import { ReactNode } from 'react';
import Spinner from './Spinner';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed select-none';

const variantStyles: Record<string, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:bg-[#e55a27] active:bg-[#cc4f22] focus-visible:outline-[var(--accent)]',
  secondary:
    'bg-transparent border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white active:bg-[#e55a27]',
  ghost:
    'bg-transparent text-[var(--accent)] hover:bg-orange-50 active:bg-orange-100',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600',
};

const sizeStyles: Record<string, string> = {
  sm: 'min-h-[44px] px-4 py-2 text-sm',
  md: 'min-h-[44px] px-5 py-2.5 text-base',
  lg: 'min-h-[44px] px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  icon,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading ? true : undefined}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {icon && <span aria-hidden="true">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
