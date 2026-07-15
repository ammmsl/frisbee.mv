import Avatar from './Avatar';

export interface PersonCardProps {
  name: string;
  title: string;
  term: string;
  bio: string;
  photo?: string | null;
  /** Extra classes on the card root (e.g. grid column spans) */
  className?: string;
}

export default function PersonCard({
  name,
  title,
  term,
  bio,
  photo = null,
  className = '',
}: PersonCardProps) {
  return (
    <div className={`flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 gap-4 ${className}`}>
      {/* Avatar row */}
      <div className="flex items-center gap-3">
        <Avatar src={photo ?? null} name={name} size="lg" />
        <div className="min-w-0">
          {/* wrap, don't truncate — real names/titles were getting clipped in the 4-col grid */}
          <p className="font-bold text-[var(--text-primary)]">{name}</p>
          <p className="text-sm text-[var(--accent)] font-medium">{title}</p>
          <p className="text-xs text-[var(--text-muted)]">{term}</p>
        </div>
      </div>

      {/* Bio — omitted when empty (bios are owner-owed; no placeholder text ships).
          3-line CSS clamp, flex-1 so cards stretch to equal height. */}
      {bio?.trim() && (
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
      )}
    </div>
  );
}
