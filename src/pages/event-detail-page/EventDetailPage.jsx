import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { fetchEventById, getCachedEventById } from '../../services/api/api';
import { formatEventDate } from '../../utils/date';
import './EventDetailPage.css';

const EVENT_PLACEHOLDER_IMAGE = '/event-placeholder-art.png';

const EventDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { locale, t } = useLanguage();
  const navigationEvent = location.state?.event || null;
  const [event, setEvent] = useState(() => navigationEvent || getCachedEventById(eventId));
  const [loading, setLoading] = useState(() => !navigationEvent && !getCachedEventById(eventId));

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

  return (
    <div className="event-detail-container">
      <button className="event-detail-back" type="button" onClick={handleBack}>
        <span aria-hidden="true">←</span>
        {t('eventDetail.backToEvents')}
      </button>
      <div
        className="event-detail-background"
        style={{
          backgroundImage: event.img
            ? `url("${event.img}"), url("${EVENT_PLACEHOLDER_IMAGE}")`
            : `url("${EVENT_PLACEHOLDER_IMAGE}")`,
        }}
      ></div>
      <div className="event-detail-info">
        <h1 className="event-detail-title">{event.title}</h1>
        <p className="event-detail-description">{event.description}</p>
        <time className="event-detail-date" dateTime={typeof event.date === 'string' ? event.date : undefined}>
          {formatEventDate(event, locale)}
        </time>
      </div>
    </div>
  );
};

export default EventDetailPage;
