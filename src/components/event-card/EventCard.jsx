// React imports
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
// Component imports
import { fetchEvents, getCachedEvents } from '../../services/api/api';
import { formatEventDate, formatEventTime, getEventDateTimeAttribute } from '../../utils/date';
import { isExplicitlyFree } from '../../models/event';
import SaveEventButton from '../saved-events/SaveEventButton';
// CSS imports
import './EventCard.css'; 

const EVENTS_PER_BATCH = 20;
const EVENT_PLACEHOLDER_IMAGE = '/event-placeholder-art.png';

const readListState = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key)) || {};
  } catch {
    return {};
  }
};

const EventCard = ({ tag, cornerColor, searchQuery, filters = {} }) => {
  const location = useLocation();
  const { locale, t } = useLanguage();
  const listStateKey = `gee:event-list:${location.pathname}`;
  const restoredScroll = useRef(false);
  const hasStructuredFilters = Object.entries(filters).some(([key, value]) => key !== 'category' && value);
  const [events, setEvents] = useState(() => hasStructuredFilters ? [] : (getCachedEvents(tag) || []));
  const [loading, setLoading] = useState(() => hasStructuredFilters || getCachedEvents(tag) === null);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(
    () => Math.max(EVENTS_PER_BATCH, readListState(listStateKey).visibleCount || 0),
  );

  useEffect(() => {
    let active = true;
    const cachedEvents = hasStructuredFilters ? null : getCachedEvents(tag);

    if (cachedEvents !== null) {
      setEvents(cachedEvents);
      setLoading(false);
    } else {
      setEvents([]);
      setLoading(true);
    }
    setError('');

    const loadEvents = async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const data = await fetchEvents(filters);
          if (!active) return;
          setEvents(Array.isArray(data) ? data : []);
          setLoading(false);
          return;
        } catch (loadError) {
          if (!active) return;
          if (attempt === 2) {
            setError(loadError?.message || t('events.loadError'));
            setLoading(false);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
          }
        }
      }
    };

    loadEvents();
    return () => { active = false; };
  }, [filters, hasStructuredFilters, tag, t]);

  const filteredEvents = useMemo(() => (
    events.filter(event =>
      event.title?.toLocaleLowerCase(locale).includes(searchQuery.trim().toLocaleLowerCase(locale))
    )
  ), [events, locale, searchQuery]);

  useEffect(() => {
    const savedState = searchQuery ? {} : readListState(listStateKey);
    setVisibleCount(Math.max(EVENTS_PER_BATCH, savedState.visibleCount || 0));
    restoredScroll.current = false;
  }, [tag, searchQuery, listStateKey]);

  useEffect(() => {
    if (loading || error || searchQuery || restoredScroll.current) return undefined;
    if (events.length > 0 && filteredEvents.length === 0) return undefined;

    const savedState = readListState(listStateKey);
    if (!savedState.scrollY) {
      restoredScroll.current = true;
      return undefined;
    }
    if (visibleCount < (savedState.visibleCount || EVENTS_PER_BATCH)) return undefined;

    restoredScroll.current = true;
    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => window.scrollTo(0, savedState.scrollY));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [error, events.length, filteredEvents.length, listStateKey, loading, searchQuery, visibleCount]);

  const rememberListPosition = () => {
    sessionStorage.setItem(listStateKey, JSON.stringify({
      scrollY: window.scrollY,
      visibleCount,
    }));
  };

  const showMoreEvents = () => {
    setVisibleCount((count) => {
      const nextCount = count + EVENTS_PER_BATCH;
      sessionStorage.setItem(listStateKey, JSON.stringify({
        ...readListState(listStateKey),
        visibleCount: nextCount,
      }));
      return nextCount;
    });
  };

  if (loading) {
    return <div className="loading-spinner" role="status" aria-label={t('events.loading')}></div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  return (
    <>
      {filteredEvents.length === 0 ? (
        <p className="no-events-message">{t('events.emptyCategory')}</p>
      ) : (
        <div className="event-listing">
          <p className="event-results-count">
            {t('events.resultCount', { count: filteredEvents.length })}
          </p>
          <div className="event-cards">
            {filteredEvents.slice(0, visibleCount).map((event, index) => (
              <div
                key={event.id || `${event.title}-${event.date}-${index}`}
                className="event-card-shell"
                style={{ '--corner-color': getColorFromGradient(cornerColor) }}
              >
                <Link
                  className="event-card"
                  to={`/event/${encodeURIComponent(event.id)}`}
                  state={{ event, from: location.pathname }}
                  onClick={rememberListPosition}
                >
                <img
                  className={`event-img ${event.img ? '' : 'is-placeholder'}`.trim()}
                  src={event.img || EVENT_PLACEHOLDER_IMAGE}
                  alt=""
                  loading={index < 6 ? 'eager' : 'lazy'}
                  onError={(imageEvent) => {
                    imageEvent.currentTarget.onerror = null;
                    imageEvent.currentTarget.classList.add('is-placeholder');
                    imageEvent.currentTarget.src = EVENT_PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="corner-tag" style={{ background: cornerColor }}></div>
                <h2>{event.title}</h2>
                <div className="event-card-meta">
                  {event.tag && <span className="event-category">{event.tag}</span>}
                  {isExplicitlyFree(event) && <span className="event-price">{t('events.free')}</span>}
                  <time className="event-date" dateTime={getEventDateTimeAttribute(event)}>
                    {formatEventDate(event, locale)}
                  </time>
                  <span className="event-time">
                    {event.has_start_time ? formatEventTime(event, locale) : t('events.timeUnknown')}
                  </span>
                  {event.venue && <span className="event-venue">{event.venue}</span>}
                </div>
                </Link>
                {event.id && <SaveEventButton eventId={event.id} compact />}
              </div>
            ))}
          </div>
          {visibleCount < filteredEvents.length && (
            <button
              className="load-more-events"
              type="button"
              onClick={showMoreEvents}
            >
              {t('events.loadMore')}
              <span>
                {t('events.remainingCount', {
                  count: Math.min(EVENTS_PER_BATCH, filteredEvents.length - visibleCount),
                })}
              </span>
            </button>
          )}
        </div>
      )}
    </>
  );
};

const getColorFromGradient = (gradient) => {
  // Extract the first color from the gradient string (Corner color)
  const colors = gradient.match(/#([0-9a-f]{6}|[0-9a-f]{3})/gi);
  return colors ? colors[0] : '#fff';
};

export default EventCard;
