/**
 * Session schedule helper — pure server-side, no dependencies.
 *
 * Sessions run every Tuesday (day 2) and Friday (day 5) at 17:30 MVT.
 * Location: Villingili Football Ground, Malé.
 *
 * All date arithmetic uses UTC offsets; MVT = UTC+5.
 */

export interface NextSession {
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

function buildSession(date: Date, dayOfWeek: number): NextSession {
  return {
    dayName: DAY_NAMES[dayOfWeek],
    fullDate: `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    time: '5:30 PM',
    location: 'Villingili Football Ground, Malé',
  };
}
