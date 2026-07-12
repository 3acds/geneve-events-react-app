// React imports
import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="category-page-container">
      <main className="category-content">
        <h1 className="category-title">{displayTag}</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('events.searchPlaceholder')}
            aria-label={t('events.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <EventCard
          key={tag}
          tag={tag}
          cornerColor={cornerColor}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
};

export default CategoryPage;
