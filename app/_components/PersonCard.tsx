import Avatar from './Avatar';

export interface PersonCardProps {
  name: string;
  title: string;
  term: string;
  bio: string;
  photo?: string | null;
}

export default function PersonCard({
  name,
  title,
  term,
  bio,
  photo = null,
}: PersonCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 gap-4">
      {/* Avatar row */}
      <div className="flex items-center gap-3">
        <Avatar src={photo ?? null} name={name} size="lg" />
        <div className="min-w-0">
          <p className="font-bold text-[var(--text-primary)] truncate">{name}</p>
          <p className="text-sm text-[var(--accent)] font-medium truncate">{title}</p>
          <p className="text-xs text-[var(--text-muted)] truncate">{term}</p>
        </div>
      </div>

      {/* Bio — 3-line CSS clamp, flex-1 so cards stretch to equal height */}
      <p
        className="flex-1 text-sm text-[var(--text-muted)] leading-relaxed overflow-hidden"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {bio}
      </p>
    </div>
  );
}
