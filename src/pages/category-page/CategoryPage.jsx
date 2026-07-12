// React imports
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// Component imports
import EventCard from '../../components/event-card/EventCard';
import data from '../home-page/data/static-data.json';
// CSS imports
import './CategoryPage.css';

const CategoryPage = () => {
  const { tag } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const category = data.categories.find(({ apiTag }) => apiTag === tag);
  const displayTag = location.state?.displayTag || category?.displayTag || tag;
  const cornerColor = location.state?.cornerColor
    || category?.cornerColor
    || 'linear-gradient(to right, #FFEC00, #FF0000)';
  const [searchQuery, setSearchQuery] = useState('');

  const handleCardClick = (event) => {
    navigate(`/event/${event.id}`, { state: { event } });
  };

  return (
    <div className="category-page-container">
      <main className="category-content">
        <h1 className="category-title">{displayTag}</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <EventCard
          tag={tag}
          cornerColor={cornerColor}
          handleCardClick={handleCardClick}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
};

export default CategoryPage;
