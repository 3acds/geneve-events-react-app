import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { fetchEventById } from '../../services/api/api';
import { formatEventDate } from '../../utils/date';
import './EventDetailPage.css';

const EventDetailPage = () => {
  const location = useLocation();
  const { eventId } = useParams();
  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!location.state?.event);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) return;
    let active = true;
    fetchEventById(eventId)
      .then((data) => active && setEvent(data))
      .catch(() => active && setError("L'événement n'a pas été trouvé."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [event, eventId]);

  if (loading) {
    return <div className="loading-spinner" role="status" aria-label="Chargement"></div>;
  }

  if (!event) {
    return <p className="event-detail-error">{error || "L'événement n'a pas été trouvé."}</p>;
  }

  return (
    <div className="event-detail-container">
      <div
        className="event-detail-background"
        style={event.img ? { backgroundImage: `url(${event.img})` } : undefined}
      ></div>
      <div className="event-detail-info">
        <h1 className="event-detail-title">{event.title}</h1>
        <p className="event-detail-description">{event.description}</p>
        <time className="event-detail-date" dateTime={typeof event.date === 'string' ? event.date : undefined}>
          {formatEventDate(event)}
        </time>
      </div>
    </div>
  );
};

export default EventDetailPage;
