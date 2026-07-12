const API_URL = (import.meta.env.VITE_API_URL || 'https://geneva-events-api.onrender.com')
  .replace(/\/$/, '');

const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_PREFIX = `gee:api:v1:${API_URL}:`;
const ALL_EVENTS_CACHE_KEY = 'events:all';
const memoryCache = new Map();
const pendingRequests = new Map();

const getStorage = () => {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const isCacheRecord = (record) => (
  record
  && Number.isFinite(record.cachedAt)
  && Object.prototype.hasOwnProperty.call(record, 'data')
);

const seedEventMemoryCache = (data, cachedAt) => {
  if (!Array.isArray(data)) return;

  data.forEach((event) => {
    if (event?.id == null) return;
    const eventKey = `event:${String(event.id)}`;
    const currentRecord = memoryCache.get(eventKey);
    if (!currentRecord || currentRecord.cachedAt <= cachedAt) {
      memoryCache.set(eventKey, { cachedAt, data: event });
    }
  });
};

const readStorageRecord = (storage, storageKey) => {
  try {
    const rawRecord = storage.getItem(storageKey);
    if (!rawRecord) return null;

    const record = JSON.parse(rawRecord);
    return isCacheRecord(record) ? record : null;
  } catch {
    return null;
  }
};

const getCacheRecord = (cacheKey) => {
  const memoryRecord = memoryCache.get(cacheKey);
  if (isCacheRecord(memoryRecord)) return memoryRecord;

  const storage = getStorage();
  if (!storage) return null;

  const record = readStorageRecord(storage, `${CACHE_PREFIX}${cacheKey}`);
  if (!record) return null;

  memoryCache.set(cacheKey, record);
  seedEventMemoryCache(record.data, record.cachedAt);
  return record;
};

const removeExpiredCacheEntries = (storage, excludedStorageKey) => {
  const expiredEntries = [];

  try {
    for (let index = 0; index < storage.length; index += 1) {
      const storageKey = storage.key(index);
      if (!storageKey?.startsWith(CACHE_PREFIX) || storageKey === excludedStorageKey) continue;

      const record = readStorageRecord(storage, storageKey);
      if (!record || Date.now() - record.cachedAt >= CACHE_TTL_MS) {
        expiredEntries.push({ storageKey, cachedAt: record?.cachedAt || 0 });
      }
    }

    expiredEntries
      .sort((first, second) => first.cachedAt - second.cachedAt)
      .forEach(({ storageKey }) => storage.removeItem(storageKey));
  } catch {
    // The in-memory cache still works when browser storage is unavailable.
  }
};

const setCacheRecord = (cacheKey, data, cachedAt = Date.now()) => {
  const record = { cachedAt, data };
  memoryCache.set(cacheKey, record);
  seedEventMemoryCache(data, cachedAt);

  const storage = getStorage();
  if (!storage) return;

  const storageKey = `${CACHE_PREFIX}${cacheKey}`;
  const serializedRecord = JSON.stringify(record);

  try {
    storage.setItem(storageKey, serializedRecord);
  } catch {
    removeExpiredCacheEntries(storage, storageKey);
    try {
      storage.setItem(storageKey, serializedRecord);
    } catch {
      // A full or restricted localStorage should never prevent API requests.
    }
  }
};

const isFresh = (record) => (
  Boolean(record) && Date.now() - record.cachedAt < CACHE_TTL_MS
);

const shouldUseStaleData = (error) => (
  !Number.isInteger(error?.status)
  || error.status === 429
  || error.status >= 500
);

const requestJson = async (path, errorMessage, cacheKey, fallbackRecord = null) => {
  const cachedRecord = getCacheRecord(cacheKey);
  if (isFresh(cachedRecord)) return cachedRecord.data;

  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) return pendingRequest;

  const request = (async () => {
    try {
      const response = await fetch(`${API_URL}${path}`);
      if (!response.ok) {
        const error = new Error(`${errorMessage} (${response.status})`);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      setCacheRecord(cacheKey, data);
      return data;
    } catch (error) {
      const staleRecord = getCacheRecord(cacheKey) || fallbackRecord;
      if (staleRecord && shouldUseStaleData(error)) return staleRecord.data;
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
};

const getNewestRecord = (...records) => (
  records
    .filter(isCacheRecord)
    .sort((first, second) => second.cachedAt - first.cachedAt)[0] || null
);

const getTagCacheKey = (tag) => `events:tag:${tag}`;

const getCachedEvents = (tag = 'all') => {
  const directRecord = getCacheRecord(
    tag === 'all' ? ALL_EVENTS_CACHE_KEY : getTagCacheKey(tag),
  );

  if (tag === 'all') {
    return Array.isArray(directRecord?.data) ? directRecord.data : null;
  }

  const allEventsRecord = getCacheRecord(ALL_EVENTS_CACHE_KEY);
  const derivedRecord = Array.isArray(allEventsRecord?.data)
    ? {
      cachedAt: allEventsRecord.cachedAt,
      data: allEventsRecord.data.filter((event) => event.tag === tag),
    }
    : null;
  const newestRecord = getNewestRecord(
    Array.isArray(directRecord?.data) ? directRecord : null,
    derivedRecord,
  );

  return newestRecord ? newestRecord.data : null;
};

const findCachedEventRecord = (eventId) => {
  const normalizedId = String(eventId);
  const directRecord = getCacheRecord(`event:${normalizedId}`);
  const candidates = directRecord ? [directRecord] : [];

  const addCandidate = (record) => {
    if (!Array.isArray(record?.data)) return;
    const event = record.data.find((item) => String(item?.id) === normalizedId);
    if (event) candidates.push({ cachedAt: record.cachedAt, data: event });
  };

  memoryCache.forEach((record, cacheKey) => {
    if (cacheKey.startsWith('events:')) addCandidate(record);
  });

  const storage = getStorage();
  if (storage) {
    try {
      for (let index = 0; index < storage.length; index += 1) {
        const storageKey = storage.key(index);
        if (!storageKey?.startsWith(`${CACHE_PREFIX}events:`)) continue;
        addCandidate(readStorageRecord(storage, storageKey));
      }
    } catch {
      // Memory candidates are enough when storage cannot be enumerated.
    }
  }

  return getNewestRecord(...candidates);
};

const getCachedEventById = (eventId) => findCachedEventRecord(eventId)?.data || null;

// Fetch all events. The trailing slash avoids an extra redirect on the API.
const fetchEvents = async () => (
  requestJson('/events/', 'Unable to fetch events', ALL_EVENTS_CACHE_KEY)
);

const fetchEventById = async (eventId) => {
  const cachedEvent = findCachedEventRecord(eventId);
  if (isFresh(cachedEvent)) return cachedEvent.data;

  return requestJson(
    `/events/${encodeURIComponent(eventId)}`,
    'Unable to fetch event',
    `event:${String(eventId)}`,
    cachedEvent,
  );
};

// Fetch events by tag, or derive them from a fresh all-events response.
const fetchEventsByTag = async (tag) => {
  const allEventsRecord = getCacheRecord(ALL_EVENTS_CACHE_KEY);
  if (isFresh(allEventsRecord) && Array.isArray(allEventsRecord.data)) {
    return allEventsRecord.data.filter((event) => event.tag === tag);
  }

  return requestJson(
    `/events/tag/${encodeURIComponent(tag)}`,
    'Unable to fetch events by tag',
    getTagCacheKey(tag),
  );
};

// Fetch events by date
const fetchEventsByDate = async (day, month, year) => {
  const params = new URLSearchParams();
  if (day != null) params.set('day', day);
  if (month != null) params.set('month', month);
  if (year != null) params.set('year', year);

  const allEventsRecord = getCacheRecord(ALL_EVENTS_CACHE_KEY);
  const validDay = day == null || (Number(day) >= 1 && Number(day) <= 31);
  const validMonth = month == null || (Number(month) >= 1 && Number(month) <= 12);
  const hasDateFilter = day != null || month != null || year != null;

  if (
    hasDateFilter
    && validDay
    && validMonth
    && isFresh(allEventsRecord)
    && Array.isArray(allEventsRecord.data)
  ) {
    return allEventsRecord.data.filter((event) => (
      (day == null || Number(event.day) === Number(day))
      && (month == null || Number(event.month) === Number(month))
      && (year == null || Number(event.year) === Number(year))
    ));
  }

  const query = params.toString();
  return requestJson(
    `/events/date${query ? `?${query}` : ''}`,
    'Unable to fetch events by date',
    `events:date:${query}`,
  );
};

export {
  fetchEventById,
  fetchEvents,
  fetchEventsByTag,
  fetchEventsByDate,
  getCachedEventById,
  getCachedEvents,
};
