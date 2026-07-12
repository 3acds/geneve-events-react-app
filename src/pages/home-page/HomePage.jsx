import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
// Static data imports
import data from '../home-page/data/static-data.json';
// CSS imports
import './HomePage.css';


const HomePage = () => {
  const { getCategoryLabel, t } = useLanguage();

  return (
    <main className="home-page">
      <h1 className='home-title'>{t('home.categoriesTitle')}</h1>
      <div className="category-cards">
        {data.categories.map((event, index) => (
          <Link
            key={event.apiTag}
            className="category-card"
            to={`/category/${encodeURIComponent(event.apiTag)}`}
            state={{ cornerColor: event.cornerColor }}
            style={{ '--title-color': getColorFromGradient(event.cornerColor) }}
          >
            <img
              className='event-img'
              src={event.img}
              alt=""
              loading={index < 4 ? 'eager' : 'lazy'}
              fetchPriority={index < 2 ? 'high' : 'auto'}
            />
            <div className="corner-tag" style={{ background: event.cornerColor }}></div>
            <h2>{getCategoryLabel(event.apiTag, event.displayTag)}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
};

const getColorFromGradient = (gradient) => {
  // Extract the first color from the gradient string
  const colors = gradient.match(/#([0-9a-f]{6}|[0-9a-f]{3})/gi);
  return colors ? colors[0] : '#fff';
};

export default HomePage;
