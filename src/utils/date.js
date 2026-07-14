const DATE_PARTS_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/;
const GENEVA_TIME_ZONE = 'Europe/Zurich';

const fromFirestoreTimestamp = (value) => {
  if (value instanceof Date) return value;
  if (value && typeof value.toDate === 'function') return value.toDate();
  const seconds = value?.seconds ?? value?._seconds;
  return Number.isFinite(seconds) ? new Date(seconds * 1000) : null;
};

export const parseEventTimestamp = (value) => {
  const firestoreDate = fromFirestoreTimestamp(value);
  if (firestoreDate) return { date: firestoreDate, timeZone: GENEVA_TIME_ZONE };
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = value.trim();
  const parts = normalized.match(DATE_PARTS_PATTERN);
  if (parts) {
    const [, year, month, day, hour = '00', minute = '00', second = '00'] = parts;
    const date = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
    const valid = date.getUTCFullYear() === +year
      && date.getUTCMonth() === +month - 1 && date.getUTCDate() === +day
      && date.getUTCHours() === +hour && date.getUTCMinutes() === +minute;
    return valid ? { date, timeZone: 'UTC' } : null;
  }
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : { date, timeZone: GENEVA_TIME_ZONE };
};

const legacyDateValue = (event) => {
  if (event?.date != null) return event.date;
  if (event?.year && event?.month && event?.day) {
    return `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`;
  }
  return null;
};

export const getEventStart = (event) => parseEventTimestamp(event?.start_at ?? legacyDateValue(event));
export const getEventEnd = (event) => parseEventTimestamp(event?.end_at);

const formatDateValue = (parsed, locale) => new Intl.DateTimeFormat(locale, {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: parsed.timeZone,
}).format(parsed.date);

const calendarKey = (parsed) => new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: parsed.timeZone,
}).format(parsed.date);

export const formatEventDate = (event, locale = 'fr-CH') => {
  const start = getEventStart(event);
  if (!start) return '';
  const end = getEventEnd(event);
  if (!end || calendarKey(start) === calendarKey(end)) return formatDateValue(start, locale);
  return `${formatDateValue(start, locale)} – ${formatDateValue(end, locale)}`;
};

export const formatEventTime = (event, locale = 'fr-CH') => {
  if (event?.has_start_time !== true) return '';
  const start = getEventStart(event);
  if (!start) return '';
  const formatter = (parsed) => new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', timeZone: parsed.timeZone,
  }).format(parsed.date);
  const end = getEventEnd(event);
  return end && calendarKey(start) === calendarKey(end)
    ? `${formatter(start)} – ${formatter(end)}` : formatter(start);
};

export const getEventDateTimeAttribute = (event) => {
  const value = event?.start_at ?? legacyDateValue(event);
  return typeof value === 'string' && parseEventTimestamp(value) ? value : undefined;
};
