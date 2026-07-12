import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../navbar/LanguageSwitcher';
import categories from '../../pages/home-page/data/static-data.json';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth(); 
  const { getCategoryLabel, t } = useLanguage();

  return (
    <>
      <footer className="footer">
        <div className='footer-main-div'>
          <div className='gee footer-section'>
            <h3>GEE</h3>
            <div className='gee-content footer-category-links'>
              <Link to="/" className='content-element-margin'>{t('nav.home')}</Link>
              {categories.categories.map((category) => (
                <Link
                  key={category.apiTag}
                  to={`/category/${encodeURIComponent(category.apiTag)}`}
                  state={{ cornerColor: category.cornerColor }}
                  className='content-element-margin'
                >
                  {getCategoryLabel(category.apiTag, category.displayTag)}
                </Link>
              ))}
              {user && (
                <Link to="/profile" className='content-element-margin'>
                  {t('footer.profile')}
                </Link>
              )}
            </div>
          </div>
          <div className='about footer-section'>
            <h3>{t('footer.aboutHeading')}</h3>
            <div className='about-content content-padding content-direction'>
              <Link to="/about" className='content-element-margin'>{t('footer.project')}</Link>
            </div>
          </div>
          <div className='contact footer-section'>
            <h3>{t('footer.contactHeading')}</h3>
            <div className='contact-content content-padding content-direction'>
              <a href="https://bsilva.ch/" target="_blank" rel="noreferrer" className='content-element-margin'>{t('footer.portfolio')}</a>
            </div>   
          </div>
        </div>
        <div className="footer-mobile">
          <Link className="footer-mobile-brand" to="/">GEE</Link>
          <nav className="footer-mobile-links" aria-label={t('footer.navigationAria')}>
            <Link to="/">{t('nav.home')}</Link>
            <Link
              to="/category/all"
              state={{ cornerColor: 'linear-gradient(to right, #91F1EF, #FFD5E0)' }}
            >
              {t('footer.events')}
            </Link>
            <Link to="/about">{t('footer.aboutHeading')}</Link>
            {user && <Link to="/profile">{t('footer.profile')}</Link>}
            <a href="https://bsilva.ch/" target="_blank" rel="noreferrer">{t('footer.portfolio')}</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="copyright">{t('footer.copyright')}</p>
          <div className="footer-language-control">
            <span className="footer-language-label">{t('language.selector')}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
