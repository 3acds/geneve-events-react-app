const API_URL = (import.meta.env.VITE_API_URL || 'https://geneva-events-api.onrender.com')
  .replace(/\/$/, '');

const requestJson = async (path, errorMessage) => {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error(`${errorMessage} (${response.status})`);
  return response.json();
};

// Fetch all events
const fetchEvents = async () => {
  return requestJson('/events', 'Unable to fetch events');
};

const fetchEventById = async (eventId) => {
  return requestJson(`/events/${encodeURIComponent(eventId)}`, 'Unable to fetch event');
};

// Fetch events by tag
const fetchEventsByTag = async (tag) => {
  return requestJson(`/events/tag/${encodeURIComponent(tag)}`, 'Unable to fetch events by tag');
};

// Fetch events by date
const fetchEventsByDate = async (day, month, year) => {
  const params = new URLSearchParams();
  if (day != null) params.set('day', day);
  if (month != null) params.set('month', month);
  if (year != null) params.set('year', year);
  return requestJson(`/events/date?${params}`, 'Unable to fetch events by date');
};

export { fetchEventById, fetchEvents, fetchEventsByTag, fetchEventsByDate };
