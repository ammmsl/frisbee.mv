export interface SkeletonProps {
  className: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-gray-200 ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-sweep 1.5s linear infinite',
      }}
    >
      <style>{`
        @keyframes skeleton-sweep {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}
