import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../context/SavedEventsContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchSavedEvents, removeSavedEvent } from '../../services/api/api';
import { formatEventDate, formatEventTime, parseEventTimestamp } from '../../utils/date';
import './SavedEventsPage.css';

const SavedEventsPage = () => {
  const { user, authLoading } = useAuth();
  const { setKnownSaved } = useSavedEvents();
  const { locale, t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    if (!user) { setLoading(false); return () => { active = false; }; }
    setLoading(true);
    fetchSavedEvents(user).then((data) => {
      if (!active) return;
      setRecords(data);
      data.forEach(({ event_id: eventId }) => setKnownSaved(eventId, true));
    }).catch((loadError) => active && setError(loadError.message || t('saved.loadFailed')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [authLoading, setKnownSaved, t, user]);

  const sorted = useMemo(() => [...records].sort((a, b) => {
    if (!a.available) return 1;
    if (!b.available) return -1;
    const left = parseEventTimestamp(a.event.start_at || a.event.date)?.date?.getTime() || Infinity;
    const right = parseEventTimestamp(b.event.start_at || b.event.date)?.date?.getTime() || Infinity;
    const now = Date.now();
    const leftExpired = left < now;
    const rightExpired = right < now;
    return leftExpired === rightExpired ? left - right : (leftExpired ? 1 : -1);
  }), [records]);

  const remove = async (eventId) => {
    if (removing[eventId]) return;
    setRemoving((state) => ({ ...state, [eventId]: true }));
    try {
      await removeSavedEvent(user, eventId);
      setRecords((items) => items.filter((item) => item.event_id !== eventId));
      setKnownSaved(eventId, false);
    } catch (removeError) {
      setError(removeError.message || t('saved.actionFailed'));
    } finally {
      setRemoving((state) => ({ ...state, [eventId]: false }));
    }
  };

  if (authLoading || loading) return <div className="loading-spinner" role="status" aria-label={t('events.loading')}></div>;
  if (!user) return <main className="saved-events-page"><h1>{t('saved.title')}</h1><p>{t('saved.loginRequired')}</p></main>;

  return <main className="saved-events-page">
    <div className="saved-events-heading"><h1>{t('saved.title')}</h1><Link to="/calendar/all?view=agenda">{t('saved.calendarView')}</Link></div>
    {error && <p className="saved-events-error" role="alert">{error}</p>}
    {!sorted.length ? <p>{t('saved.empty')}</p> : <div className="saved-events-list">{sorted.map((record) => {
      const event = record.event;
      const eventTime = event && parseEventTimestamp(event.end_at || event.start_at || event.date)?.date?.getTime();
      const expired = Number.isFinite(eventTime) && eventTime < Date.now();
      return <article key={record.event_id} className="saved-event">
        {record.available ? <>
          <h2><Link to={`/event/${encodeURIComponent(event.id)}`} state={{ event, from: '/saved' }}>{event.title}</Link></h2>
          <p>{formatEventDate(event, locale)} · {event.has_start_time ? formatEventTime(event, locale) : t('events.timeUnknown')}</p>
          {(event.venue_name || event.venue) && <p>{event.venue_name || event.venue}</p>}
          {event.tag && <p>{event.tag}</p>}
          {expired && <p className="saved-event-status">{t('saved.expired')}</p>}
        </> : <><h2>{t('saved.unavailable')}</h2><p>{t('saved.unavailableDetail')}</p></>}
        <button type="button" disabled={removing[record.event_id]} onClick={() => remove(record.event_id)}>{t('saved.remove')}</button>
      </article>;
    })}</div>}
  </main>;
};

export default SavedEventsPage;
