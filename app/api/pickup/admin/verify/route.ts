import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// In-memory rate limiter (same pattern as /api/contact) — resets on restart
const rateLimitMap = new Map<string, number[]>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_S = 3600;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = RATE_LIMIT_WINDOW_S * 1000;
  const existing = rateLimitMap.get(ip) ?? [];
  const recent = existing.filter((ts) => now - ts < windowMs);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { password } = body as { password?: string };

  if (typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const hash = process.env.PICKUP_ADMIN_PASSWORD_HASH;
  if (!hash) {
    console.error('PICKUP_ADMIN_PASSWORD_HASH environment variable is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const match = await bcrypt.compare(password, hash);
  if (!match) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
