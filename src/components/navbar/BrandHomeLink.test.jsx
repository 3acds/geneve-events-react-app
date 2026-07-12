import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../context/LanguageContext';
import BrandHomeLink from './BrandHomeLink';

describe('BrandHomeLink', () => {
  it('keeps both visual wordmark states inside an accessible home link', () => {
    render(
      <MemoryRouter>
        <LanguageProvider initialLanguage="fr">
          <BrandHomeLink />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole('link', {
      name: 'Geneva Events Explorer — accueil',
    });

    expect(homeLink.getAttribute('href')).toBe('/');
    expect(within(homeLink).getByText('Geneva')).toBeTruthy();
    expect(within(homeLink).getByText('Events')).toBeTruthy();
    expect(within(homeLink).getByText('GEE')).toBeTruthy();
    expect(homeLink.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(homeLink.querySelector('img').getAttribute('alt')).toBe('');
  });
});
