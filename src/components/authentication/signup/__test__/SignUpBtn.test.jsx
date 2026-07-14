import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { signInWithPopup } from 'firebase/auth';
import { LanguageProvider } from '../../../../context/LanguageContext';
import { NotificationProvider } from '../../../../context/NotificationContext';
import SignUpBtn from '../SignUpBtn';

jest.mock('firebase/auth', () => ({ signInWithPopup: jest.fn() }));
jest.mock('../../../../services/database/firebase', () => ({ auth: {}, googleProvider: {} }));

test('shows a translated notification when Google sign-up fails', async () => {
  signInWithPopup.mockRejectedValueOnce(new Error('failed'));
  render(
    <LanguageProvider initialLanguage="en">
      <NotificationProvider><SignUpBtn onRegister={jest.fn()} /></NotificationProvider>
    </LanguageProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: /Sign up with Google/i }));
  expect(await screen.findByText('Google sign-up failed. Please try again.')).toBeTruthy();
});
