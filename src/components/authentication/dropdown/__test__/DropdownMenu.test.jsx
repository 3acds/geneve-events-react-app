import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../../context/AuthContext';
import { LanguageProvider } from '../../../../context/LanguageContext';
import { NotificationProvider } from '../../../../context/NotificationContext';
import DropdownMenu from '../DropdownMenu';

test('opens accessible sign-in and sign-up actions for a guest', () => {
  render(
    <LanguageProvider initialLanguage="en">
      <MemoryRouter>
        <AuthProvider><NotificationProvider><DropdownMenu /></NotificationProvider></AuthProvider>
      </MemoryRouter>
    </LanguageProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open account menu' }));
  expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Sign up with Google/i })).toBeTruthy();
});
