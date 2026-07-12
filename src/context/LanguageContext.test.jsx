import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LanguageSwitcher from '../components/navbar/LanguageSwitcher';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../i18n/translations';

const LanguageProbe = () => {
  const { locale, t } = useLanguage();
  return <p>{locale}|{t('home.categoriesTitle')}</p>;
};

describe('LanguageProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = 'fr';
  });

  it('contains the same messages in all four languages', () => {
    const frenchKeys = Object.keys(TRANSLATIONS.fr).sort();

    LANGUAGE_OPTIONS.forEach(({ code }) => {
      expect(Object.keys(TRANSLATIONS[code]).sort()).toEqual(frenchKeys);
    });
  });

  it('uses a saved language and updates the document language', async () => {
    window.localStorage.setItem('gee:language', 'de');

    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>,
    );

    expect(screen.getByText('de-CH|Kategorien')).toBeTruthy();
    await waitFor(() => expect(document.documentElement.lang).toBe('de-CH'));
  });

  it('switches languages and persists the selection', async () => {
    render(
      <LanguageProvider initialLanguage="fr">
        <LanguageSwitcher />
        <LanguageProbe />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByLabelText('Choisir la langue'), {
      target: { value: 'it' },
    });

    expect(screen.getByText('it-CH|Categorie')).toBeTruthy();
    await waitFor(() => expect(window.localStorage.getItem('gee:language')).toBe('it'));
  });
});
