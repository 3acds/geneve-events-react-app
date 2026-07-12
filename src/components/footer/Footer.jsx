import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import categories from '../../pages/home-page/data/static-data.json';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth(); 

  return (
    <>
      <footer className="footer">
        <div className='footer-main-div'>
          <div className='gee footer-section'>
            <h3>GEE</h3>
            <div className='gee-content footer-category-links'>
              <Link to="/" className='content-element-margin'>Accueil</Link>
              {categories.categories.map((category) => (
                <Link
                  key={category.apiTag}
                  to={`/category/${encodeURIComponent(category.apiTag)}`}
                  state={{ displayTag: category.displayTag, cornerColor: category.cornerColor }}
                  className='content-element-margin'
                >
                  {category.displayTag}
                </Link>
              ))}
              {user && (
                <Link to="/profile" className='content-element-margin'>
                  Profil
                </Link>
              )}
            </div>
          </div>
          <div className='about footer-section'>
            <h3>À propos</h3>
            <div className='about-content content-padding content-direction'>
              <Link to="/about" className='content-element-margin'>Le projet GEE</Link>
            </div>
          </div>
          <div className='contact footer-section'>
            <h3>Contact</h3>
            <div className='contact-content content-padding content-direction'>
              <a href="https://bsilva.ch/" target="_blank" rel="noreferrer" className='content-element-margin'>Portfolio</a>
            </div>   
          </div>
        </div>
        <div className='copyright'>
          <p>© Copyright by B.Silva. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
