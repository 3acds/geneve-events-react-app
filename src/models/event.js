/** Normalize API events while retaining every legacy field. */
export const normalizeEvent = (value) => {
  const event = value && typeof value === 'object' ? value : {};
  return {
    ...event,
    id: event.id == null ? '' : String(event.id),
    title: typeof event.title === 'string' ? event.title : '',
    description: typeof event.description === 'string' ? event.description : '',
    img: typeof event.img === 'string' ? event.img : '',
    tag: typeof event.tag === 'string' ? event.tag : '',
    source_url: typeof event.source_url === 'string' ? event.source_url : '',
    start_at: event.start_at ?? null,
    end_at: event.end_at ?? null,
    has_start_time: event.has_start_time === true,
    raw_date: typeof event.raw_date === 'string' ? event.raw_date : '',
    price_type: event.price_type === 'free' ? 'free' : 'unknown',
    source: typeof event.source === 'string' ? event.source : '',
    scraped_at: event.scraped_at ?? null,
    updated_at: event.updated_at ?? null,
    venue_name: typeof event.venue_name === 'string'
      ? event.venue_name : (typeof event.venue === 'string' ? event.venue : ''),
    venue: typeof event.venue_name === 'string'
      ? event.venue_name : (typeof event.venue === 'string' ? event.venue : ''),
    address: typeof event.address === 'string' ? event.address : '',
    postal_code: typeof event.postal_code === 'string' ? event.postal_code : '',
    city: typeof event.city === 'string' ? event.city : '',
    latitude: event.latitude !== null && event.latitude !== ''
      && Number.isFinite(Number(event.latitude)) ? Number(event.latitude) : null,
    longitude: event.longitude !== null && event.longitude !== ''
      && Number.isFinite(Number(event.longitude)) ? Number(event.longitude) : null,
    location_status: ['confirmed', 'partial', 'geocoded', 'ambiguous', 'missing']
      .includes(event.location_status) ? event.location_status : 'missing',
    raw_location: typeof event.raw_location === 'string' ? event.raw_location : '',
    location_checked_at: event.location_checked_at ?? null,
  };
};

export const normalizeEvents = (values) => (
  Array.isArray(values) ? values.map(normalizeEvent) : []
);

export const isExplicitlyFree = (event) => event?.price_type === 'free';
