'use client';

import { useId, useRef, useState } from 'react';
import Button from '@/app/_components/Button';
import { useToast } from '@/app/_components/Toast';

const SUBJECTS = [
  'General Enquiry',
  'Sponsorship',
  'Media Enquiry',
  'Membership',
  'Event Enquiry',
] as const;

interface Errors {
  name?:    string;
  email?:   string;
  subject?: string;
  message?: string;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ContactForm() {
  const { show } = useToast();

  const nameId     = useId();
  const emailId    = useId();
  const subjectId  = useId();
  const messageId  = useId();

  const nameErrId    = `${nameId}-err`;
  const emailErrId   = `${emailId}-err`;
  const subjectErrId = `${subjectId}-err`;
  const messageErrId = `${messageId}-err`;

  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [subject,    setSubject]    = useState('');
  const [message,    setMessage]    = useState('');
  const [honeypot,   setHoneypot]   = useState('');
  const [errors,     setErrors]     = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // Honeypot ref — off-screen hidden field
  const honeypotRef = useRef<HTMLInputElement>(null);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim())              e.name    = 'Name is required.';
    if (!isValidEmail(email))      e.email   = 'Enter a valid email address.';
    if (!subject)                  e.subject = 'Please select a subject.';
    if (message.trim().length < 20) e.message = 'Message must be at least 20 characters.';
    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, subject, message, website: honeypot }),
      });

      if (res.ok) {
        show("Message sent! We'll be in touch soon.", 'success');
        setName(''); setEmail(''); setSubject(''); setMessage(''); setHoneypot('');
      } else {
        show('Something went wrong. Please try again or email us directly.', 'error');
      }
    } catch {
      show('Something went wrong. Please try again or email us directly.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full min-h-[44px] px-3 py-2.5 rounded-lg border bg-[var(--bg-page)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--accent)] focus-visible:border-[var(--accent)] transition-colors';

  const normalBorder = 'border-[var(--border)]';
  const errorBorder  = 'border-red-500';

  return (
    <div className="space-y-5">
      {/* Honeypot — visually hidden, off-screen */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        <label htmlFor="website-field">Website</label>
        <input
          id="website-field"
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor={nameId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          Name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id={nameId}
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
          aria-describedby={errors.name ? nameErrId : undefined}
          aria-invalid={!!errors.name}
          className={`${inputClass} ${errors.name ? errorBorder : normalBorder}`}
          autoComplete="name"
        />
        {errors.name && (
          <p id={nameErrId} role="alert" className="mt-1 text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor={emailId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          Email <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
          aria-describedby={errors.email ? emailErrId : undefined}
          aria-invalid={!!errors.email}
          className={`${inputClass} ${errors.email ? errorBorder : normalBorder}`}
          autoComplete="email"
        />
        {errors.email && (
          <p id={emailErrId} role="alert" className="mt-1 text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor={subjectId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          Subject <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id={subjectId}
          value={subject}
          onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors((p) => ({ ...p, subject: undefined })); }}
          aria-describedby={errors.subject ? subjectErrId : undefined}
          aria-invalid={!!errors.subject}
          className={`${inputClass} ${errors.subject ? errorBorder : normalBorder} cursor-pointer`}
        >
          <option value="">Select a subject…</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.subject && (
          <p id={subjectErrId} role="alert" className="mt-1 text-xs text-red-600">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor={messageId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          Message <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id={messageId}
          value={message}
          onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((p) => ({ ...p, message: undefined })); }}
          aria-describedby={errors.message ? messageErrId : undefined}
          aria-invalid={!!errors.message}
          rows={4}
          className={`${inputClass} min-h-[120px] resize-y ${errors.message ? errorBorder : normalBorder}`}
          placeholder="Your message…"
        />
        {errors.message && (
          <p id={messageErrId} role="alert" className="mt-1 text-xs text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        variant="primary"
        className="w-full"
        onClick={handleSubmit}
        loading={submitting}
        disabled={submitting}
      >
        Send Message
      </Button>
    </div>
  );
}
