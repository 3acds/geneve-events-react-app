import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const BrandHomeLink = () => {
  const { t } = useLanguage();

  return (
    <Link className="navbar-brand" to="/" aria-label={t('nav.brandHomeAria')}>
      <span className="navbar-brand-expanded" aria-hidden="true">
        <span>Geneva</span>
        <span className="navbar-brand-events">Events</span>
      </span>
      <span className="navbar-brand-compact" aria-hidden="true">
        <img
          className="navbar-brand-flag"
          src="/geneva-flag.svg"
          alt=""
          draggable="false"
        />
        <span className="navbar-brand-initials">GEE</span>
      </span>
    </Link>
  );
};

export default BrandHomeLink;
