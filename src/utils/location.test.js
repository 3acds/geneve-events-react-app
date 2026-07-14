import {
  buildOpenStreetMapEmbedUrl,
  buildOpenStreetMapSearchUrl,
  safeExternalHttpUrl,
} from './location';

it('builds a safely encoded map search only from sufficient location data', () => {
  const url = buildOpenStreetMapSearchUrl({
    venue_name: 'Salle & Co', address: 'Rue du Test 4', postal_code: '1201', city: 'Genève',
  });
  expect(url).toContain('https://www.openstreetmap.org/search?query=');
  expect(url).toContain('Salle%20%26%20Co%2C%20Rue%20du%20Test%204');
  expect(buildOpenStreetMapSearchUrl({ venue_name: 'Unknown venue' })).toBe('');
  expect(safeExternalHttpUrl('javascript:alert(1)')).toBe('');
});

it('embeds maps only for valid confirmed or geocoded coordinates', () => {
  expect(buildOpenStreetMapEmbedUrl({
    latitude: 46.2044, longitude: 6.1432, location_status: 'confirmed',
  })).toContain('openstreetmap.org/export/embed.html');
  expect(buildOpenStreetMapEmbedUrl({
    latitude: 999, longitude: 6.1432, location_status: 'confirmed',
  })).toBe('');
  expect(buildOpenStreetMapEmbedUrl({
    latitude: 46.2044, longitude: 6.1432, location_status: 'partial',
  })).toBe('');
});
