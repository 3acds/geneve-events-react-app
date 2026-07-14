const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseIsoDate = (value) => {
  const match = typeof value === 'string' ? value.match(ISO_DATE_PATTERN) : null;
  if (!match) return null;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  return date.getUTCFullYear() === +match[1]
    && date.getUTCMonth() === +match[2] - 1
    && date.getUTCDate() === +match[3] ? date : null;
};

export const toIsoDate = (date) => date.toISOString().slice(0, 10);

export const addDays = (date, amount) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
};

export const startOfWeek = (date) => addDays(date, -((date.getUTCDay() + 6) % 7));
export const endOfWeek = (date) => addDays(startOfWeek(date), 6);
export const startOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
export const endOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

export const getCalendarPeriod = (view, selectedDate) => {
  const start = view === 'agenda' ? startOfWeek(selectedDate) : startOfMonth(selectedDate);
  const end = view === 'agenda' ? endOfWeek(selectedDate) : endOfMonth(selectedDate);
  return { start, end };
};

export const getMonthGridDates = (selectedDate) => {
  const gridStart = startOfWeek(startOfMonth(selectedDate));
  const gridEnd = endOfWeek(endOfMonth(selectedDate));
  const dates = [];
  for (let date = gridStart; date <= gridEnd; date = addDays(date, 1)) dates.push(date);
  return dates;
};

const timestampDateKey = (value) => {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match && parseIsoDate(match[1])) return match[1];
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) return toIsoDate(value);
  const seconds = value?.seconds ?? value?._seconds;
  if (Number.isFinite(seconds)) return toIsoDate(new Date(seconds * 1000));
  return null;
};

export const getEventDateSpan = (event) => {
  const fallback = event?.year && event?.month && event?.day
    ? `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`
    : null;
  const start = timestampDateKey(event?.start_at ?? event?.date) || fallback;
  if (!start || !parseIsoDate(start)) return null;
  const end = timestampDateKey(event?.end_at) || start;
  return { start, end: parseIsoDate(end) && end >= start ? end : start };
};

export const eventOccursOnDate = (event, dateKey) => {
  const span = getEventDateSpan(event);
  return Boolean(span && span.start <= dateKey && span.end >= dateKey);
};

export const eventsForDate = (events, dateKey) => events
  .filter((event) => eventOccursOnDate(event, dateKey))
  .sort((first, second) => {
    if (first.has_start_time !== second.has_start_time) return first.has_start_time ? 1 : -1;
    return String(first.start_at || first.date || '').localeCompare(String(second.start_at || second.date || ''));
  });
