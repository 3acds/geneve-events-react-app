// React imports
import React, { useEffect, useState } from 'react';
// Component imports
import { fetchEventsByTag, fetchEvents } from '../../services/api/api';
import { formatEventDate } from '../../utils/date';
// CSS imports
import './EventCard.css'; 

const EventCard = ({ tag, cornerColor, handleCardClick, searchQuery }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const data = tag === 'all' ? await fetchEvents() : await fetchEventsByTag(tag);
          setEvents(Array.isArray(data) ? data : []);
          setLoading(false);
          return;
        } catch (loadError) {
          if (attempt === 2) {
            setError('Failed to load events after multiple attempts. Please try again later.');
            setLoading(false);
          }
        }
      }
    };

    loadEvents();
  }, [tag]);

  useEffect(() => {
    setFilteredEvents(
      events.filter(event =>
        event.title?.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase())
      )
    );
  }, [searchQuery, events]);

  if (loading) {
    return <div className="loading-spinner"></div>;
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
        <p className="no-events-message">Il n'y a actuellement aucun événement disponible dans cette catégorie. Veuillez réessayer plus tard.</p>
      ) : (
        <div className="event-cards">
          {filteredEvents.map((event, index) => (
            <article
              key={event.id || `${event.title}-${event.date}-${index}`}
              className="event-card"
              style={{ '--corner-color': getColorFromGradient(cornerColor) }}
              onClick={() => handleCardClick(event)}
              onKeyDown={(keyboardEvent) => {
                if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                  keyboardEvent.preventDefault();
                  handleCardClick(event);
                }
              }}
              role="button"
              tabIndex="0"
            >
              <img className="event-img" src={event.img || "/event-placeholder.svg"} alt="" onError={(imageEvent) => {imageEvent.currentTarget.onerror = null; imageEvent.currentTarget.src = "/event-placeholder.svg";}}/>
              <div className="corner-tag" style={{ background: cornerColor }}></div>
              <h2>{event.title}</h2>
              <time className="event-date" dateTime={typeof event.date === 'string' ? event.date : undefined}>
                {formatEventDate(event)}
              </time>
            </article>
          ))}
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
