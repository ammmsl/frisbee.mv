export interface SpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

export default function Spinner({ size = 'sm', className = '' }: SpinnerProps) {
  const dim = size === 'sm' ? 16 : 24;

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ animation: 'spin 0.75s linear infinite', display: 'inline-block', verticalAlign: 'middle' }}
    >
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
