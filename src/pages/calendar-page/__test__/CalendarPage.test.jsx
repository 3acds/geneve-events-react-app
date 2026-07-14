import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LanguageProvider } from '../../../context/LanguageContext';
import { fetchEvents } from '../../../services/api/api';
import CalendarPage from '../CalendarPage';

jest.mock('../../../services/api/api', () => ({ fetchEvents: jest.fn() }));

const events = [
  { id: 'date-only', title: 'Open exhibition', start_at: '2026-07-14T00:00:00', has_start_time: false },
  { id: 'timed', title: 'Evening concert', start_at: '2026-07-14T18:30:00', has_start_time: true },
  { id: 'same-time', title: 'Second concert', start_at: '2026-07-14T18:30:00', has_start_time: true },
  { id: 'multi', title: 'Summer festival', start_at: '2026-07-14T10:00:00', end_at: '2026-07-16T18:00:00', has_start_time: true },
];

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
};

const renderCalendar = (url = '/calendar/Concert?view=month&date=2026-07-14') => render(
  <LanguageProvider initialLanguage="en">
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/calendar/:tag" element={<><CalendarPage /><LocationProbe /></>} />
        <Route path="/event/:eventId" element={<p>Event detail opened</p>} />
      </Routes>
    </MemoryRouter>
  </LanguageProvider>,
);

describe('CalendarPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchEvents.mockResolvedValue(events);
  });

  it('requests the visible month and preserves category and time filters', async () => {
    renderCalendar('/calendar/Concert?view=month&date=2026-07-14&start_time_from=18%3A00&list_when=this_week');
    await waitFor(() => expect(fetchEvents).toHaveBeenCalledWith({
      date_from: '2026-07-01',
      date_to: '2026-07-31',
      category: 'Concert',
      start_time_from: '18:00',
      start_time_to: '',
    }));
    expect(screen.getByRole('link', { name: 'List' }).getAttribute('href'))
      .toBe('/category/Concert?start_time_from=18%3A00&when=this_week');
  });

  it('navigates months and requests the new date range', async () => {
    renderCalendar();
    await screen.findAllByText('Evening concert');
    fireEvent.click(screen.getByRole('button', { name: 'Next period' }));
    await waitFor(() => expect(fetchEvents).toHaveBeenLastCalledWith(expect.objectContaining({
      date_from: '2026-08-01', date_to: '2026-08-31',
    })));
    expect(screen.getByTestId('location').textContent).toContain('date=2026-08-01');
  });

  it('returns to today and switches to an agenda range', async () => {
    renderCalendar('/calendar/Concert?view=month&date=2026-01-14');
    await waitFor(() => expect(document.querySelector('.loading-spinner')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByTestId('location').textContent).not.toContain('date=2026-01-14');
    fireEvent.click(screen.getByRole('button', { name: 'Agenda' }));
    await waitFor(() => expect(fetchEvents).toHaveBeenLastCalledWith(expect.objectContaining({
      date_from: expect.any(String), date_to: expect.any(String),
    })));
    expect(screen.getByTestId('location').textContent).toContain('view=agenda');
  });

  it('renders untimed, timed, simultaneous and multi-day previews without fabricated times', async () => {
    renderCalendar();
    expect((await screen.findAllByLabelText(/Open exhibition, Time not specified/)).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Evening concert, 18:30/).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Second concert, 18:30/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Multiple days').length).toBeGreaterThan(0);
    expect(document.querySelector('.month-mobile-agenda')).toBeTruthy();
  });

  it('opens the existing event detail route from a preview', async () => {
    renderCalendar();
    const links = await screen.findAllByLabelText(/Evening concert, 18:30/);
    fireEvent.click(links[0]);
    expect(await screen.findByText('Event detail opened')).toBeTruthy();
  });

  it('shows empty and API failure states', async () => {
    fetchEvents.mockResolvedValueOnce([]);
    const { unmount } = renderCalendar();
    expect(await screen.findByText('No events in this period.')).toBeTruthy();
    unmount();
    fetchEvents.mockRejectedValueOnce(new Error('Calendar unavailable'));
    renderCalendar('/calendar/all?view=agenda&date=2026-07-14');
    expect((await screen.findByRole('alert')).textContent).toBe('Calendar unavailable');
  });
});
