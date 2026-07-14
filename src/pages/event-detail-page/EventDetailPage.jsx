import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { fetchEventById, fetchRelatedEvents, getCachedEventById } from '../../services/api/api';
import { formatEventDate, formatEventTime, getEventDateTimeAttribute, parseEventTimestamp } from '../../utils/date';
import { isExplicitlyFree } from '../../models/event';
import {
  buildOpenStreetMapEmbedUrl,
  buildOpenStreetMapSearchUrl,
  formatLocationAddress,
  safeExternalHttpUrl,
} from '../../utils/location';
import './EventDetailPage.css';
import SaveEventButton from '../../components/saved-events/SaveEventButton';

const EVENT_PLACEHOLDER_IMAGE = '/event-placeholder-art.png';

const EventDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { locale, t } = useLanguage();
  const navigationEvent = location.state?.event || null;
  const [event, setEvent] = useState(() => navigationEvent || getCachedEventById(eventId));
  const [loading, setLoading] = useState(() => !navigationEvent && !getCachedEventById(eventId));
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    let active = true;
    const cachedEvent = navigationEvent || getCachedEventById(eventId);

    if (cachedEvent) {
      setEvent(cachedEvent);
      setLoading(false);
    } else {
      setEvent(null);
      setLoading(true);
    }
    fetchEventById(eventId)
      .then((data) => {
        if (!active) return;
        setEvent(data);
      })
      .catch(() => {
        if (!active) return;
        setEvent(null);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [eventId, navigationEvent]);

  useEffect(() => {
    let active = true;
    if (!event?.id) return () => { active = false; };
    fetchRelatedEvents(event.id, 4)
      .then((data) => active && setRelatedEvents(data))
      .catch(() => active && setRelatedEvents([]));
    return () => { active = false; };
  }, [event?.id]);

  if (loading) {
    return <div className="loading-spinner" role="status" aria-label={t('events.loading')}></div>;
  }

  if (!event) {
    return <p className="event-detail-error">{t('eventDetail.notFound')}</p>;
  }

  const handleBack = () => {
    if (location.state?.from) {
      if ((window.history.state?.idx || 0) > 0) {
        navigate(-1);
      } else {
        navigate(location.state.from);
      }
    } else if (event.tag) {
      navigate(`/category/${encodeURIComponent(event.tag)}`);
    } else {
      navigate('/');
    }
  };

  const imageUrl = safeExternalHttpUrl(event.img);
  const sourceUrl = safeExternalHttpUrl(event.source_url);
  const mapUrl = buildOpenStreetMapSearchUrl(event);
  const embedUrl = buildOpenStreetMapEmbedUrl(event);
  const formattedAddress = formatLocationAddress(event);
  const hasTextLocation = Boolean(event.venue_name || formattedAddress || event.raw_location);
  const updated = parseEventTimestamp(event.updated_at || event.scraped_at);
  const updatedLabel = updated ? new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium', timeStyle: 'short', timeZone: updated.timeZone,
  }).format(updated.date) : '';

  return (
    <div className="event-detail-container">
      <button className="event-detail-back" type="button" onClick={handleBack}>
        <span className="event-detail-back-icon" aria-hidden="true">←</span>
        <span className="event-detail-back-label">{t('eventDetail.backToEvents')}</span>
      </button>
      <div
        className="event-detail-background"
        style={{
          backgroundImage: imageUrl
            ? `url("${imageUrl}"), url("${EVENT_PLACEHOLDER_IMAGE}")`
            : `url("${EVENT_PLACEHOLDER_IMAGE}")`,
        }}
      ></div>
      <div className="event-detail-info">
        {imageUrl && <img className="event-detail-image" src={imageUrl} alt={event.title} loading="eager" />}
        <h1 className="event-detail-title">{event.title}</h1>
        {event.id && <SaveEventButton eventId={event.id} />}
        <div className="event-detail-meta">
          <time className="event-detail-date" dateTime={getEventDateTimeAttribute(event)}>
            {formatEventDate(event, locale)}
          </time>
          <span>{event.has_start_time ? formatEventTime(event, locale) : t('eventDetail.dateOnly')}</span>
          {event.tag && <span>{t('eventDetail.category')}: {event.tag}</span>}
          {isExplicitlyFree(event) && <span>{t('events.free')}</span>}
        </div>
        {hasTextLocation && (
          <section className="event-detail-section event-location" aria-labelledby="event-location-title">
            <h2 id="event-location-title">{t('eventDetail.location')}</h2>
            <address>
              {event.venue_name && <strong>{event.venue_name}</strong>}
              {formattedAddress && <span>{formattedAddress}</span>}
              {!event.venue_name && !formattedAddress && event.raw_location && <span>{event.raw_location}</span>}
            </address>
            {mapUrl && <a className="event-detail-action" href={mapUrl} target="_blank" rel="noreferrer">{t('eventDetail.openMaps')}</a>}
            {embedUrl ? (
              <iframe
                className="event-location-map"
                src={embedUrl}
                title={t('eventDetail.mapTitle', { location: event.venue_name || formattedAddress })}
                loading="lazy"
                referrerPolicy="no-referrer"
              ></iframe>
            ) : <p className="event-map-fallback">{t('eventDetail.mapUnavailable')}</p>}
          </section>
        )}
        {event.description && (
          <section className="event-detail-section">
            <h2>{t('eventDetail.description')}</h2>
            <p className="event-detail-description">{event.description}</p>
          </section>
        )}
        {(sourceUrl || updatedLabel) && (
          <footer className="event-detail-source">
            {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">{t('eventDetail.originalSource')}</a>}
            {updatedLabel && <small>{t('eventDetail.updated', { date: updatedLabel })}</small>}
          </footer>
        )}
        {relatedEvents.length > 0 && (
          <section className="event-related" aria-labelledby="related-events-title">
            <h2 id="related-events-title">{t('eventDetail.related')}</h2>
            <div className="event-related-list">
              {relatedEvents.map((related) => (
                <Link key={related.id} to={`/event/${encodeURIComponent(related.id)}`} state={{ event: related, from: location.pathname }}>
                  <strong>{related.title}</strong>
                  <span>{formatEventDate(related, locale)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;
