import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { formatEventDate } from '../../utils/date';
import './EventDetailPage.css';

const EventDetailPage = () => {
  const location = useLocation();
  const event = location.state?.event;
  const { showNotification } = useNotification();

  if (!event) {
    showNotification('Event was not found.', 'error');
    return <p>EL'événement n'a pas été trouvé.</p>;
  }

  return (
    <div className="event-detail-container">
      <div
        className="event-detail-background"
        style={{ backgroundImage: `url(${event.img})` }}
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
