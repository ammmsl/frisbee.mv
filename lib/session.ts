/**
 * Session schedule helper — pure server-side, no dependencies.
 *
 * Sessions run every Tuesday (day 2) and Friday (day 5) at 17:30 MVT.
 * Location: Villingili Football Ground, Malé.
 *
 * All date arithmetic uses UTC offsets; MVT = UTC+5.
 */

export interface NextSession {
  dateStr: string;     // 'YYYY-MM-DD' — used for override checks in Phase 2
  dayName: string;
  fullDate: string;
  time: string;
  location: string;
}

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Tuesday = 2, Friday = 5 (Sunday = 0 … Saturday = 6)
const SESSION_DAYS = new Set([2, 5]);
const SESSION_HOUR = 20;
const SESSION_MINUTE = 0;
const MVT_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC+5

/**
 * Returns the next scheduled session in Maldives Time.
 *
 * Edge cases:
 *  - If today is a session day and the session hasn't started yet → today.
 *  - If today is a session day and it's at or after 17:30 MVT → skip to next occurrence.
 *  - Otherwise → the next Tuesday or Friday, whichever comes first.
 */
export function getNextSession(): NextSession {
  const now = new Date();

  // Shift UTC clock forward by +5 h to get MVT wall-clock values via UTC getters
  const mvt = new Date(now.getTime() + MVT_OFFSET_MS);

  const mvtDayOfWeek = mvt.getUTCDay();
  const mvtHour = mvt.getUTCHours();
  const mvtMinute = mvt.getUTCMinutes();

  const nowMinutes = mvtHour * 60 + mvtMinute;
  const sessionMinutes = SESSION_HOUR * 60 + SESSION_MINUTE;

  // Midnight of today in MVT (stored as a UTC Date so getUTC* getters work correctly)
  const todayMidnight = new Date(
    Date.UTC(mvt.getUTCFullYear(), mvt.getUTCMonth(), mvt.getUTCDate()),
  );

  // If today is a session day and the session hasn't started yet → today
  if (SESSION_DAYS.has(mvtDayOfWeek) && nowMinutes < sessionMinutes) {
    return buildSession(todayMidnight, mvtDayOfWeek);
  }

  // Search up to 7 days ahead for the next session day
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const candidateDayOfWeek = (mvtDayOfWeek + daysAhead) % 7;
    if (SESSION_DAYS.has(candidateDayOfWeek)) {
      const candidateDate = new Date(
        todayMidnight.getTime() + daysAhead * 24 * 60 * 60 * 1000,
      );
      return buildSession(candidateDate, candidateDayOfWeek);
    }
  }

  // Unreachable — there are always Tuesdays and Fridays within 7 days
  throw new Error('getNextSession: could not find a session day within 7 days');
}

/**
 * Returns the next scheduled session that falls strictly after the given date string.
 * Used by the home page to skip cancelled sessions.
 */
export function getNextSessionAfterDate(dateStr: string): NextSession {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Midnight of the day AFTER dateStr (UTC)
  const startMidnight = new Date(Date.UTC(y, m - 1, d + 1));
  const startDayOfWeek = startMidnight.getUTCDay();

  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    const candidateDayOfWeek = (startDayOfWeek + daysAhead) % 7;
    if (SESSION_DAYS.has(candidateDayOfWeek)) {
      const candidateDate = new Date(
        startMidnight.getTime() + daysAhead * 24 * 60 * 60 * 1000,
      );
      return buildSession(candidateDate, candidateDayOfWeek);
    }
  }

  throw new Error('getNextSessionAfterDate: could not find a session day within 7 days');
}

/**
 * Returns the next N scheduled sessions starting from now.
 * Used by the calendar page "Coming Up" section.
 */
export function getNextNSessions(n: number): NextSession[] {
  const sessions: NextSession[] = [];
  let current = getNextSession();
  sessions.push(current);
  for (let i = 1; i < n; i++) {
    current = getNextSessionAfterDate(current.dateStr);
    sessions.push(current);
  }
  return sessions;
}

/** Date of the very first frisbee session — used to compute consecutive weeks. */
const FIRST_SESSION_DATE = '2024-01-05';

/**
 * Returns the number of complete weeks elapsed since the first session.
 * Recalculates on every call so the home page stat stays current.
 */
export function getConsecutiveWeeks(): number {
  const [y, m, d] = FIRST_SESSION_DATE.split('-').map(Number);
  const start = Date.UTC(y, m - 1, d);
  return Math.floor((Date.now() - start) / (7 * 24 * 60 * 60 * 1000));
}

function buildSession(date: Date, dayOfWeek: number): NextSession {
  const y = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return {
    dateStr: `${y}-${mo}-${d}`,
    dayName: DAY_NAMES[dayOfWeek],
    fullDate: `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    time: '8:00 PM',
    location: 'Villingili Football Ground, Malé',
  };
}
