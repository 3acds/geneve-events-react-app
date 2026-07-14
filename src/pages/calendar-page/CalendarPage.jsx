import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { fetchEvents } from '../../services/api/api';
import { formatEventTime } from '../../utils/date';
import {
  addDays,
  eventsForDate,
  getCalendarPeriod,
  getEventDateSpan,
  getMonthGridDates,
  parseIsoDate,
  toIsoDate,
} from '../../utils/calendar';
import './CalendarPage.css';

const todayInGeneva = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Zurich',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const dateLabel = (date, locale, options = {}) => new Intl.DateTimeFormat(locale, {
  timeZone: 'UTC', ...options,
}).format(date);

const EventPreview = ({ event, dateKey, locale, t, from }) => {
  const time = formatEventTime(event, locale);
  const span = getEventDateSpan(event);
  const multiDay = span && span.start !== span.end;
  const status = event.has_start_time ? time : t('calendar.timeUnknown');
  return (
    <Link
      className={`calendar-event ${event.has_start_time ? 'is-timed' : 'is-untimed'}`}
      to={`/event/${encodeURIComponent(event.id)}`}
      state={{ event, from }}
      aria-label={`${event.title}, ${status}`}
    >
      <span className="calendar-event-status">{status}</span>
      <span className="calendar-event-title">{event.title}</span>
      {multiDay && <span className="calendar-event-duration">{t('calendar.multiDay')}</span>}
      {span?.start < dateKey && <span className="calendar-event-duration">{t('calendar.continues')}</span>}
    </Link>
  );
};

const CalendarPage = () => {
  const { tag = 'all' } = useParams();
  const location = useLocation();
  const { locale, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const todayKey = todayInGeneva();
  const view = searchParams.get('view') === 'agenda' ? 'agenda' : 'month';
  const selectedKey = parseIsoDate(searchParams.get('date'))
    ? searchParams.get('date') : todayKey;
  const selectedDate = useMemo(() => parseIsoDate(selectedKey), [selectedKey]);
  const period = useMemo(() => getCalendarPeriod(view, selectedDate), [selectedDate, view]);
  const periodStart = toIsoDate(period.start);
  const periodEnd = toIsoDate(period.end);
  const startTimeFrom = searchParams.get('start_time_from') || '';
  const startTimeTo = searchParams.get('start_time_to') || '';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setLoading(true);
    setError('');
    fetchEvents({
      date_from: periodStart,
      date_to: periodEnd,
      category: tag === 'all' ? '' : tag,
      start_time_from: startTimeFrom,
      start_time_to: startTimeTo,
    }).then((data) => {
      if (requestId.current === currentRequest) setEvents(data);
    }).catch((loadError) => {
      if (requestId.current === currentRequest) {
        setEvents([]);
        setError(loadError?.message || t('events.loadError'));
      }
    }).finally(() => {
      if (requestId.current === currentRequest) setLoading(false);
    });
  }, [periodEnd, periodStart, startTimeFrom, startTimeTo, t, tag]);

  const updateCalendarState = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next, { replace: true });
  };

  const navigatePeriod = (direction) => {
    const next = view === 'agenda'
      ? addDays(selectedDate, direction * 7)
      : new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth() + direction, 1));
    updateCalendarState({ date: toIsoDate(next) });
  };

  const dates = view === 'month'
    ? getMonthGridDates(selectedDate)
    : Array.from({ length: 7 }, (_, index) => addDays(period.start, index));
  const agendaDates = view === 'month'
    ? Array.from({ length: period.end.getUTCDate() }, (_, index) => addDays(period.start, index))
    : dates;
  const from = `${location.pathname}${location.search}`;
  const listParams = new URLSearchParams();
  if (startTimeFrom) listParams.set('start_time_from', startTimeFrom);
  if (startTimeTo) listParams.set('start_time_to', startTimeTo);
  if (searchParams.get('list_when')) listParams.set('when', searchParams.get('list_when'));
  if (searchParams.get('list_date_from')) listParams.set('date_from', searchParams.get('list_date_from'));
  if (searchParams.get('list_date_to')) listParams.set('date_to', searchParams.get('list_date_to'));
  if (searchParams.get('list_q')) listParams.set('q', searchParams.get('list_q'));
  const listSearch = listParams.toString();

  return (
    <main className="calendar-page">
      <div className="calendar-heading-row">
        <div>
          <p className="calendar-eyebrow">{t('calendar.eyebrow')}</p>
          <h1>{t('calendar.title')}</h1>
        </div>
        <nav className="discovery-switcher" aria-label={t('calendar.discoveryViews')}>
          <Link to={`/category/${encodeURIComponent(tag)}${listSearch ? `?${listSearch}` : ''}`}>
            {t('calendar.listView')}
          </Link>
          <span aria-current="page">{t('calendar.calendarView')}</span>
        </nav>
      </div>

      <div className="calendar-toolbar">
        <div className="calendar-navigation">
          <button type="button" onClick={() => navigatePeriod(-1)} aria-label={t('calendar.previous')}>←</button>
          <button type="button" onClick={() => updateCalendarState({ date: todayKey })}>{t('calendar.today')}</button>
          <button type="button" onClick={() => navigatePeriod(1)} aria-label={t('calendar.next')}>→</button>
        </div>
        <label className="calendar-date-selector">
          <span>{t('calendar.chooseDate')}</span>
          <input type="date" value={selectedKey} onChange={(event) => updateCalendarState({ date: event.target.value })} />
        </label>
        <div className="calendar-view-switch" aria-label={t('calendar.chooseView')}>
          <button type="button" aria-pressed={view === 'month'} onClick={() => updateCalendarState({ view: 'month' })}>
            {t('calendar.month')}
          </button>
          <button type="button" aria-pressed={view === 'agenda'} onClick={() => updateCalendarState({ view: 'agenda' })}>
            {t('calendar.agenda')}
          </button>
        </div>
      </div>

      <h2 className="calendar-period-title">
        {view === 'month'
          ? dateLabel(selectedDate, locale, { month: 'long', year: 'numeric' })
          : `${dateLabel(period.start, locale, { day: 'numeric', month: 'short' })} – ${dateLabel(period.end, locale, { day: 'numeric', month: 'short', year: 'numeric' })}`}
      </h2>

      {loading && <div className="loading-spinner" role="status" aria-label={t('events.loading')}></div>}
      {!loading && error && <p className="calendar-error" role="alert">{error}</p>}
      {!loading && !error && events.length === 0 && <p className="calendar-empty">{t('calendar.emptyPeriod')}</p>}

      {!loading && !error && view === 'month' && (
        <div className="month-calendar" aria-label={t('calendar.month')}>
          <div className="month-weekdays" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => addDays(new Date(Date.UTC(2024, 0, 1)), index))
              .map((date) => <span key={date.toISOString()}>{dateLabel(date, locale, { weekday: 'short' })}</span>)}
          </div>
          <div className="month-grid">
            {dates.map((date) => {
              const dateKey = toIsoDate(date);
              const dayEvents = eventsForDate(events, dateKey);
              const outsideMonth = date.getUTCMonth() !== selectedDate.getUTCMonth();
              return (
                <section className={`month-day ${outsideMonth ? 'is-outside' : ''} ${dateKey === todayKey ? 'is-today' : ''}`} key={dateKey} aria-label={dateLabel(date, locale, { weekday: 'long', day: 'numeric', month: 'long' })}>
                  <time dateTime={dateKey}>{date.getUTCDate()}</time>
                  {!outsideMonth && dayEvents.slice(0, 3).map((event) => (
                    <EventPreview key={`${event.id}-${dateKey}`} event={event} dateKey={dateKey} locale={locale} t={t} from={from} />
                  ))}
                  {!outsideMonth && dayEvents.length > 3 && <span className="calendar-more">{t('calendar.more', { count: dayEvents.length - 3 })}</span>}
                </section>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className={`calendar-agenda ${view === 'month' ? 'month-mobile-agenda' : ''}`}>
          {agendaDates.map((date) => {
            const dateKey = toIsoDate(date);
            const dayEvents = eventsForDate(events, dateKey);
            return (
              <section className="agenda-day" key={dateKey}>
                <h3><time dateTime={dateKey}>{dateLabel(date, locale, { weekday: 'long', day: 'numeric', month: 'long' })}</time></h3>
                {dayEvents.length ? dayEvents.map((event) => (
                  <EventPreview key={`${event.id}-${dateKey}`} event={event} dateKey={dateKey} locale={locale} t={t} from={from} />
                )) : <p>{t('calendar.emptyDay')}</p>}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default CalendarPage;
