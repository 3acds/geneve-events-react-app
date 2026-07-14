import { formatEventDate, formatEventTime } from './date';

describe('event date formatting', () => {
  it('formats normalized date-only events without displaying midnight', () => {
    const event = { start_at: '2026-07-14T00:00:00', has_start_time: false };
    expect(formatEventDate(event, 'en-CH')).toBe('14 July 2026');
    expect(formatEventTime(event, 'en-CH')).toBe('');
  });

  it('formats multi-day events', () => {
    const event = {
      start_at: '2026-07-14T10:00:00',
      end_at: '2026-07-16T18:00:00',
      has_start_time: true,
    };
    expect(formatEventDate(event, 'en-CH')).toBe('14 July 2026 – 16 July 2026');
    expect(formatEventTime(event, 'en-CH')).toBe('10:00');
  });

  it('handles a known start time with no end time', () => {
    expect(formatEventTime({
      start_at: '2026-07-14T18:30:00', has_start_time: true,
    }, 'en-CH')).toBe('18:30');
  });

  it('falls back to legacy dates and rejects malformed dates', () => {
    expect(formatEventDate({ date: '2026-07-14T00:00:00' }, 'en-CH')).toBe('14 July 2026');
    expect(formatEventDate({ start_at: 'not-a-date' }, 'en-CH')).toBe('');
  });
});
