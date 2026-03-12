'use client';

import Image from 'next/image';
import { useState } from 'react';
import { avatarPalette } from '@/lib/tokens';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src: string | null;
  name: string;
  size?: AvatarSize;
}

const sizePx: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

const sizeTextClass: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
};

// Accent palette sourced from lib/tokens — all pass WCAG AA with white text
const PALETTE = avatarPalette;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (
    (parts[0][0] ?? '').toUpperCase() +
    (parts[parts.length - 1][0] ?? '').toUpperCase()
  );
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const px = sizePx[size];
  const showImage = src && !imgError;

  const sharedClasses = `rounded-full shrink-0 overflow-hidden`;

  if (showImage) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={`${sharedClasses} object-cover`}
        style={{ width: px, height: px }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={`${sharedClasses} flex items-center justify-center font-semibold text-white ${sizeTextClass[size]}`}
      style={{ width: px, height: px, backgroundColor: getColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}
