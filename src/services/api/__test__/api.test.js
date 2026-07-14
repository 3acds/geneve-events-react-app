jest.mock('../config', () => ({ __esModule: true, default: 'https://api.example.test' }));

import { buildEventFilterQuery, fetchEvents, fetchRelatedEvents } from '../api';

global.fetch = jest.fn();

describe('filtered event API', () => {
  beforeEach(() => {
    fetch.mockReset();
    window.localStorage.clear();
  });

  it('builds only supported backend filter parameters', () => {
    expect(buildEventFilterQuery({
      when: 'this_weekend', category: 'Concert', q: 'ignored', start_time_from: '18:00',
    })).toBe('when=this_weekend&category=Concert&start_time_from=18%3A00');
  });

  it('requests a shareable filtered URL and normalizes missing fields', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, title: 'Event' }] });
    const data = await fetchEvents({ date_from: '2026-07-14', category: 'Concert' });
    expect(fetch.mock.calls[0][0]).toMatch(/\/events\/\?date_from=2026-07-14&category=Concert$/);
    expect(data[0]).toMatchObject({ id: '1', has_start_time: false, price_type: 'unknown' });
  });

  it('surfaces backend validation errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false, status: 400, json: async () => ({ error: 'date_from must use YYYY-MM-DD format.' }),
    });
    await expect(fetchEvents({ date_from: 'invalid-test-value' }))
      .rejects.toThrow('date_from must use YYYY-MM-DD format.');
  });

  it('requests a bounded related-event collection', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    await fetchRelatedEvents('event/id', 4);
    expect(fetch).toHaveBeenCalledWith('https://api.example.test/events/event%2Fid/related?limit=4');
  });
});
