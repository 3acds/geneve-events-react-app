import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchEventById } from '../../services/api/api';
import { formatEventDate } from '../../utils/date';
import './EventDetailPage.css';

const EventDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
        Retour aux événements
      </button>
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
