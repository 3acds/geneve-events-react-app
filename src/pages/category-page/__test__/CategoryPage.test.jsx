import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LanguageProvider } from '../../../context/LanguageContext';
import CategoryPage from '../CategoryPage';

jest.mock('../../../components/event-card/EventCard', () => {
  const MockEventCard = () => <div>Event results</div>;
  MockEventCard.displayName = 'MockEventCard';
  return MockEventCard;
});

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.search}</output>;
};

const renderPage = (url) => render(
  <LanguageProvider initialLanguage="en">
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/category/:tag" element={<><CategoryPage /><LocationProbe /></>} />
      </Routes>
    </MemoryRouter>
  </LanguageProvider>,
);

describe('CategoryPage filters', () => {
  it('restores filters from the URL and updates them', () => {
    renderPage('/category/Concert?when=today&start_time_from=18%3A00');
    expect(screen.getByLabelText('When').value).toBe('today');
    expect(screen.getByLabelText('From time').value).toBe('18:00');
    fireEvent.change(screen.getByLabelText('When'), { target: { value: 'tomorrow' } });
    expect(screen.getByTestId('location').textContent).toContain('when=tomorrow');
  });

  it('resets all query filters while preserving the category route', () => {
    renderPage('/category/Concert?when=today&q=jazz');
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByTestId('location').textContent).toBe('');
    expect(screen.getByRole('heading', { name: 'Concert' })).toBeTruthy();
  });
});
