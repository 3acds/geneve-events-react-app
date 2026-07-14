import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../../context/LanguageContext';
import HomePage from '../HomePage';

test('links the all-events category to its shareable route', () => {
  render(
    <LanguageProvider initialLanguage="en">
      <MemoryRouter><HomePage /></MemoryRouter>
    </LanguageProvider>,
  );
  expect(screen.getByRole('link', { name: /All events/i }).getAttribute('href'))
    .toBe('/category/all');
});
