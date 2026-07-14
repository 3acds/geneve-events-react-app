import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { checkSavedEvents, removeSavedEvent, saveEvent } from '../services/api/api';

const SavedEventsContext = createContext({
  saved: {},
  pending: {},
  hydrate: async () => {},
  toggle: async () => false,
  setKnownSaved: () => {},
});

export const useSavedEvents = () => useContext(SavedEventsContext);

export const SavedEventsProvider = ({ children }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState({});
  const [pending, setPending] = useState({});
  const loaded = useRef(new Set());

  useEffect(() => {
    setSaved({});
    setPending({});
    loaded.current = new Set();
  }, [user?.uid]);

  const hydrate = useCallback(async (eventIds) => {
    if (!user) return;
    const ids = [...new Set(eventIds.filter(Boolean).map(String))]
      .filter((id) => !loaded.current.has(id));
    if (!ids.length) return;
    ids.forEach((id) => loaded.current.add(id));
    try {
      const statuses = await checkSavedEvents(user, ids);
      setSaved((current) => ({ ...current, ...statuses }));
    } catch (error) {
      ids.forEach((id) => loaded.current.delete(id));
      throw error;
    }
  }, [user]);

  const toggle = useCallback(async (eventId) => {
    if (!user || pending[eventId]) return false;
    const previous = Boolean(saved[eventId]);
    setSaved((current) => ({ ...current, [eventId]: !previous }));
    setPending((current) => ({ ...current, [eventId]: true }));
    try {
      if (previous) await removeSavedEvent(user, eventId);
      else await saveEvent(user, eventId);
      loaded.current.add(String(eventId));
      return true;
    } catch (error) {
      setSaved((current) => ({ ...current, [eventId]: previous }));
      throw error;
    } finally {
      setPending((current) => ({ ...current, [eventId]: false }));
    }
  }, [pending, saved, user]);

  const setKnownSaved = useCallback((eventId, value) => {
    loaded.current.add(String(eventId));
    setSaved((current) => ({ ...current, [eventId]: Boolean(value) }));
  }, []);

  return <SavedEventsContext.Provider value={{ saved, pending, hydrate, toggle, setKnownSaved }}>
    {children}
  </SavedEventsContext.Provider>;
};
