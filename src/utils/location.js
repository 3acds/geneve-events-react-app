const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export const formatLocationAddress = (event) => [
  clean(event?.address),
  [clean(event?.postal_code), clean(event?.city)].filter(Boolean).join(' '),
].filter(Boolean).join(', ');

export const getMapSearchQuery = (event) => {
  const venue = clean(event?.venue_name || event?.venue);
  const address = clean(event?.address);
  const postalCode = clean(event?.postal_code);
  const city = clean(event?.city);
  if (address && city) return [venue, address, postalCode, city].filter(Boolean).join(', ');
  if (venue && city) return [venue, city].join(', ');
  return '';
};

export const buildOpenStreetMapSearchUrl = (event) => {
  const query = getMapSearchQuery(event);
  return query ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}` : '';
};

export const getReliableCoordinates = (event) => {
  if (!['confirmed', 'geocoded'].includes(event?.location_status)) return null;
  const latitude = Number(event?.latitude);
  const longitude = Number(event?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
      || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }
  return { latitude, longitude };
};

export const buildOpenStreetMapEmbedUrl = (event) => {
  const coordinates = getReliableCoordinates(event);
  if (!coordinates) return '';
  const { latitude, longitude } = coordinates;
  const padding = 0.006;
  const bbox = [longitude - padding, latitude - padding, longitude + padding, latitude + padding]
    .map((value) => value.toFixed(6)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
};

export const safeExternalHttpUrl = (value) => {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};
