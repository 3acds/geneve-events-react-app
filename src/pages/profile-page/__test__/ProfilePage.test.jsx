import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfilePage from '../ProfilePage';
import { AuthProvider } from '../../../context/AuthContext';
import { NotificationProvider } from '../../../context/NotificationContext';
import { LanguageProvider } from '../../../context/LanguageContext';

describe('ProfilePage', () => {
  test('displays error message when user is not logged in', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <AuthProvider>
          <NotificationProvider><ProfilePage /></NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    expect(screen.getAllByText(/Please sign in to view your profile./i)).toHaveLength(2);
  });
});
