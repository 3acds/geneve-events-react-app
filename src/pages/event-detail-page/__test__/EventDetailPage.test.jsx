import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../../../context/LanguageContext';
import { fetchEventById, fetchRelatedEvents, getCachedEventById } from '../../../services/api/api';
import EventDetailPage from '../EventDetailPage';

jest.mock('../../../services/api/api', () => ({
  fetchEventById: jest.fn(),
  fetchRelatedEvents: jest.fn(),
  getCachedEventById: jest.fn(),
}));

const event = {
  id: 'event-1',
  title: 'Poster event',
  description: 'An event description',
  date: '2026-07-30T18:00:00.000Z',
  tag: 'Theatre',
  img: '',
};

const renderEventDetail = () => render(
  <LanguageProvider initialLanguage="en">
    <MemoryRouter initialEntries={['/event/event-1']}>
      <Routes>
        <Route path="/event/:eventId" element={<EventDetailPage />} />
        <Route path="/category/:tag" element={<p>Category restored</p>} />
      </Routes>
    </MemoryRouter>
  </LanguageProvider>,
);

describe('EventDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCachedEventById.mockReturnValue(event);
    fetchEventById.mockResolvedValue(event);
    fetchRelatedEvents.mockResolvedValue([]);
  });

  it('renders safe location, source, embedded map and related events', async () => {
    const detailedEvent = {
      ...event,
      has_start_time: false,
      venue_name: 'Victoria Hall',
      address: 'Rue du Général-Dufour 14',
      postal_code: '1204',
      city: 'Genève',
      latitude: 46.2018,
      longitude: 6.1415,
      location_status: 'confirmed',
      source_url: 'https://www.geneve.ch/agenda/example',
      updated_at: '2026-07-14T10:00:00Z',
    };
    getCachedEventById.mockReturnValue(detailedEvent);
    fetchEventById.mockResolvedValue(detailedEvent);
    fetchRelatedEvents.mockResolvedValue([{ ...event, id: 'related', title: 'Related show' }]);
    renderEventDetail();

    expect(screen.getByText('Time not specified')).toBeTruthy();
    expect(screen.getByText('Victoria Hall')).toBeTruthy();
    expect(screen.getByText(/Rue du Général-Dufour 14/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open in OpenStreetMap' }).href)
      .toContain('openstreetmap.org/search');
    expect(screen.getByTitle('Map of Victoria Hall').getAttribute('loading')).toBe('lazy');
    expect(screen.getByRole('link', { name: 'View original source' }).href)
      .toBe('https://www.geneve.ch/agenda/example');
    expect(await screen.findByText('Related show')).toBeTruthy();
  });

  it('shows a map fallback and hides unsafe or insufficient links', async () => {
    const partial = {
      ...event, venue_name: 'Venue only', location_status: 'partial',
      source_url: 'javascript:alert(1)',
    };
    getCachedEventById.mockReturnValue(partial);
    fetchEventById.mockResolvedValue(partial);
    renderEventDetail();
    expect(screen.getByText('Map unavailable without confirmed coordinates.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Open in OpenStreetMap' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'View original source' })).toBeNull();
    await waitFor(() => expect(fetchRelatedEvents).toHaveBeenCalledWith(partial.id, 4));
  });

  it('shows the compact back action and returns to the event category', async () => {
    renderEventDetail();

    expect(screen.getByRole('heading', { name: event.title })).toBeTruthy();
    await waitFor(() => expect(fetchRelatedEvents).toHaveBeenCalledWith(event.id, 4));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByText('Category restored')).toBeTruthy();
  });

  it('shows a translated error when the event cannot be loaded', async () => {
    getCachedEventById.mockReturnValue(null);
    fetchEventById.mockRejectedValue(new Error('Not found'));

    renderEventDetail();

    await waitFor(() => {
      expect(screen.getByText('The event could not be found.')).toBeTruthy();
    });
  });
});
