import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../../../context/LanguageContext';
import { fetchEventById, getCachedEventById } from '../../../services/api/api';
import EventDetailPage from '../EventDetailPage';

jest.mock('../../../services/api/api', () => ({
  fetchEventById: jest.fn(),
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
  });

  it('shows the compact back action and returns to the event category', async () => {
    renderEventDetail();

    expect(screen.getByRole('heading', { name: event.title })).toBeTruthy();
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
