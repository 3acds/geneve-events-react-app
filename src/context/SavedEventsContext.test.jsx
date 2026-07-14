import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SavedEventsProvider, useSavedEvents } from './SavedEventsContext';
import { useAuth } from './AuthContext';
import { checkSavedEvents, saveEvent } from '../services/api/api';

jest.mock('./AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../services/api/api', () => ({
  checkSavedEvents: jest.fn(),
  saveEvent: jest.fn(),
  removeSavedEvent: jest.fn(),
}));

const Probe = () => {
  const { saved, hydrate, toggle } = useSavedEvents();
  return <><span>{saved['event-1'] ? 'saved' : 'not saved'}</span>
    <button onClick={() => hydrate(['event-1'])}>load</button>
    <button onClick={() => toggle('event-1').catch(() => {})}>toggle</button></>;
};

describe('SavedEventsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { uid: 'user-1' } });
  });

  test('restores saved state from the authenticated API', async () => {
    checkSavedEvents.mockResolvedValue({ 'event-1': true });
    render(<SavedEventsProvider><Probe /></SavedEventsProvider>);
    fireEvent.click(screen.getByText('load'));
    await screen.findByText('saved');
    expect(checkSavedEvents).toHaveBeenCalledTimes(1);
  });

  test('rolls optimistic state back when saving fails', async () => {
    checkSavedEvents.mockResolvedValue({ 'event-1': false });
    saveEvent.mockRejectedValue(new Error('offline'));
    render(<SavedEventsProvider><Probe /></SavedEventsProvider>);
    fireEvent.click(screen.getByText('load'));
    await waitFor(() => expect(checkSavedEvents).toHaveBeenCalled());
    fireEvent.click(screen.getByText('toggle'));
    await waitFor(() => expect(saveEvent).toHaveBeenCalled());
    await screen.findByText('not saved');
  });
});
