// React imports
import React, { useMemo } from 'react';
import { Link, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
// Component imports
import EventCard from '../../components/event-card/EventCard';
import data from '../home-page/data/static-data.json';
// CSS imports
import './CategoryPage.css';

const CategoryPage = () => {
  const { tag } = useParams();
  const location = useLocation();
  const { getCategoryLabel, t } = useLanguage();
  const category = data.categories.find(({ apiTag }) => apiTag === tag);
  const displayTag = getCategoryLabel(tag, category?.displayTag || tag);
  const cornerColor = location.state?.cornerColor
    || category?.cornerColor
    || 'linear-gradient(to right, #FFEC00, #FF0000)';
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const filters = useMemo(() => ({
    category: tag === 'all' ? '' : tag,
    when: searchParams.get('when') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    start_time_from: searchParams.get('start_time_from') || '',
    start_time_to: searchParams.get('start_time_to') || '',
  }), [searchParams, tag]);

  const updateFilter = (name, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name === 'when' && value) {
      next.delete('date_from');
      next.delete('date_to');
    }
    if ((name === 'date_from' || name === 'date_to') && value) next.delete('when');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="category-page-container">
      <main className="category-content">
        <div className="category-heading-row">
          <h1 className="category-title">{displayTag}</h1>
          <nav className="discovery-switcher" aria-label={t('calendar.discoveryViews')}>
            <span aria-current="page">{t('calendar.listView')}</span>
            <Link to={`/calendar/${encodeURIComponent(tag)}?${new URLSearchParams({
              view: 'month',
              date: filters.date_from || new Date().toISOString().slice(0, 10),
              ...(filters.start_time_from && { start_time_from: filters.start_time_from }),
              ...(filters.start_time_to && { start_time_to: filters.start_time_to }),
              ...(filters.when && { list_when: filters.when }),
              ...(filters.date_from && { list_date_from: filters.date_from }),
              ...(filters.date_to && { list_date_to: filters.date_to }),
              ...(searchQuery && { list_q: searchQuery }),
            })}`}>{t('calendar.calendarView')}</Link>
          </nav>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('events.searchPlaceholder')}
            aria-label={t('events.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => updateFilter('q', e.target.value)}
          />
        </div>
        <form className="event-filters" onSubmit={(event) => event.preventDefault()}>
          <label>
            <span>{t('filters.when')}</span>
            <select value={filters.when} onChange={(event) => updateFilter('when', event.target.value)}>
              <option value="">{t('filters.anyDate')}</option>
              <option value="today">{t('filters.today')}</option>
              <option value="tomorrow">{t('filters.tomorrow')}</option>
              <option value="this_week">{t('filters.thisWeek')}</option>
              <option value="this_weekend">{t('filters.thisWeekend')}</option>
            </select>
          </label>
          <label>
            <span>{t('filters.dateFrom')}</span>
            <input type="date" value={filters.date_from} onChange={(event) => updateFilter('date_from', event.target.value)} />
          </label>
          <label>
            <span>{t('filters.dateTo')}</span>
            <input type="date" value={filters.date_to} onChange={(event) => updateFilter('date_to', event.target.value)} />
          </label>
          <label>
            <span>{t('filters.timeFrom')}</span>
            <input type="time" value={filters.start_time_from} onChange={(event) => updateFilter('start_time_from', event.target.value)} />
          </label>
          <label>
            <span>{t('filters.timeTo')}</span>
            <input type="time" value={filters.start_time_to} onChange={(event) => updateFilter('start_time_to', event.target.value)} />
          </label>
          <button type="button" onClick={() => setSearchParams({}, { replace: true })}>
            {t('filters.reset')}
          </button>
        </form>
        <EventCard
          key={tag}
          tag={tag}
          cornerColor={cornerColor}
          searchQuery={searchQuery}
          filters={filters}
        />
      </main>
    </div>
  );
};

export default CategoryPage;
