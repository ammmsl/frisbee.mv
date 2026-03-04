import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Only POST is allowed
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// --- Validation -----------------------------------------------------------

const ALLOWED_SUBJECTS = [
  'General Enquiry',
  'Sponsorship',
  'Media Enquiry',
  'Membership',
  'Event Enquiry',
] as const;

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// --- In-memory rate limiter ------------------------------------------------
// Resets on server restart / new serverless instance — acceptable for Phase 1.

const rateLimitMap = new Map<string, number[]>();

const RATE_LIMIT_MAX      = 5;
const RATE_LIMIT_WINDOW_S = 3600;

function isRateLimited(ip: string): boolean {
  const now       = Date.now();
  const windowMs  = RATE_LIMIT_WINDOW_S * 1000;
  const existing  = rateLimitMap.get(ip) ?? [];
  const recent    = existing.filter((ts) => now - ts < windowMs);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

// --- POST handler ---------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, subject, message, website } = body as {
    name?:    string;
    email?:   string;
    subject?: string;
    message?: string;
    website?: string;
  };

  // 1. Honeypot — silent discard
  if (website) {
    return NextResponse.json({ ok: true });
  }

  // 2. Server-side validation
  const nameStr    = typeof name    === 'string' ? name.trim()    : '';
  const emailStr   = typeof email   === 'string' ? email.trim()   : '';
  const subjectStr = typeof subject === 'string' ? subject.trim() : '';
  const messageStr = typeof message === 'string' ? message.trim() : '';

  const valid =
    nameStr.length > 0 &&
    nameStr.length <= 100 &&
    isValidEmail(emailStr) &&
    (ALLOWED_SUBJECTS as readonly string[]).includes(subjectStr) &&
    messageStr.length >= 20 &&
    messageStr.length <= 2000;

  if (!valid) {
    return NextResponse.json({ error: 'Invalid fields' }, { status: 400 });
  }

  // 3. Rate limiting
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 4. Send email
  const emailSubject = `[frisbee.mv] ${subjectStr} — from ${nameStr}`;
  const emailText    = `Name: ${nameStr}\nEmail: ${emailStr}\nSubject: ${subjectStr}\n\n${messageStr}`;
  const from         = process.env.CONTACT_EMAIL_FROM!;
  const to           = process.env.CONTACT_EMAIL_TO!;

  if (!process.env.RESEND_API_KEY) {
    // Local development: log to console, return success
    console.log('--- Contact form submission (no RESEND_API_KEY) ---');
    console.log(`To:      ${to}`);
    console.log(`From:    ${from}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Body:\n${emailText}`);
    console.log('---------------------------------------------------');
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from,
      to,
      subject: emailSubject,
      text:    emailText,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
