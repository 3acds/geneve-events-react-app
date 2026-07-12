const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export const formatEventDate = (event, locale = 'fr-CH') => {
  if (!event) return '';

  const rawDate = event.date;
  let parsedDate;

  if (typeof rawDate === 'string') {
    const dateOnlyMatch = rawDate.match(DATE_ONLY_PATTERN);
    parsedDate = dateOnlyMatch
      ? new Date(Date.UTC(
          Number(dateOnlyMatch[1]),
          Number(dateOnlyMatch[2]) - 1,
          Number(dateOnlyMatch[3]),
        ))
      : new Date(rawDate);
  } else if (rawDate instanceof Date) {
    parsedDate = rawDate;
  } else if (rawDate && typeof rawDate === 'object' && rawDate.seconds) {
    parsedDate = new Date(rawDate.seconds * 1000);
  } else if (event.year && event.month && event.day) {
    parsedDate = new Date(Date.UTC(event.year, event.month - 1, event.day));
  }

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return typeof rawDate === 'string' ? rawDate : '';
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
};
