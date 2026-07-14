import { isExplicitlyFree, normalizeEvent } from './event';

it('keeps legacy fields while defaulting normalized values to unknown', () => {
  const event = normalizeEvent({ title: 'Legacy', date: '2026-07-14', price: '0' });
  expect(event.date).toBe('2026-07-14');
  expect(event.start_at).toBeNull();
  expect(event.has_start_time).toBe(false);
  expect(isExplicitlyFree(event)).toBe(false);
});

it('displays free status only when explicitly normalized by the API', () => {
  expect(isExplicitlyFree(normalizeEvent({ price_type: 'free' }))).toBe(true);
  expect(isExplicitlyFree(normalizeEvent({ price_type: 'unknown' }))).toBe(false);
});
