// React imports
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Component imports
import { fetchEventsByTag, fetchEvents } from '../../services/api/api';
import { formatEventDate } from '../../utils/date';
// CSS imports
import './EventCard.css'; 

const EVENTS_PER_BATCH = 20;

const EventCard = ({ tag, cornerColor, searchQuery }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(EVENTS_PER_BATCH);

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

  useEffect(() => {
    setVisibleCount(EVENTS_PER_BATCH);
  }, [tag, searchQuery]);

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
        <div className="event-listing">
          <p className="event-results-count">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
          </p>
          <div className="event-cards">
            {filteredEvents.slice(0, visibleCount).map((event, index) => (
              <Link
                key={event.id || `${event.title}-${event.date}-${index}`}
                className="event-card"
                to={`/event/${encodeURIComponent(event.id)}`}
                state={{ event }}
                style={{ '--corner-color': getColorFromGradient(cornerColor) }}
              >
                <img
                  className="event-img"
                  src={event.img || "/event-placeholder.svg"}
                  alt=""
                  loading={index < 6 ? 'eager' : 'lazy'}
                  fetchPriority={index < 3 ? 'high' : 'auto'}
                  onError={(imageEvent) => {imageEvent.currentTarget.onerror = null; imageEvent.currentTarget.src = "/event-placeholder.svg";}}
                />
                <div className="corner-tag" style={{ background: cornerColor }}></div>
                <h2>{event.title}</h2>
                <time className="event-date" dateTime={typeof event.date === 'string' ? event.date : undefined}>
                  {formatEventDate(event)}
                </time>
              </Link>
            ))}
          </div>
          {visibleCount < filteredEvents.length && (
            <button
              className="load-more-events"
              type="button"
              onClick={() => setVisibleCount((count) => count + EVENTS_PER_BATCH)}
            >
              Afficher plus
              <span>{Math.min(EVENTS_PER_BATCH, filteredEvents.length - visibleCount)} événements</span>
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
