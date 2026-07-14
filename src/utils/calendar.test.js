import { eventOccursOnDate, eventsForDate, getCalendarPeriod, parseIsoDate, toIsoDate } from './calendar';

it('calculates month and Monday-based agenda ranges', () => {
  const selected = parseIsoDate('2026-07-14');
  const month = getCalendarPeriod('month', selected);
  const agenda = getCalendarPeriod('agenda', selected);
  expect(toIsoDate(month.start)).toBe('2026-07-01');
  expect(toIsoDate(month.end)).toBe('2026-07-31');
  expect(toIsoDate(agenda.start)).toBe('2026-07-13');
  expect(toIsoDate(agenda.end)).toBe('2026-07-19');
});

it('places multi-day events on every included date and keeps untimed events first', () => {
  const untimed = { id: 'a', date: '2026-07-15', has_start_time: false };
  const multi = { id: 'b', start_at: '2026-07-14T18:00:00', end_at: '2026-07-16T20:00:00', has_start_time: true };
  expect(eventOccursOnDate(multi, '2026-07-15')).toBe(true);
  expect(eventsForDate([multi, untimed], '2026-07-15').map(({ id }) => id)).toEqual(['a', 'b']);
});
