import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import './Footer.css';

const Footer = () => {
  const { user } = useAuth(); 

  return (
    <>
      <footer className="footer">
        <div className='footer-main-div'>
          <div className='gee'>
            <h3>GEE</h3>
            <div className='gee-content content-padding content-direction'>
              <Link to="/category/all" state={{ displayTag: 'Tous les évènements' }} className='content-element-margin'>Tous les évènements</Link>
              {user && (
                <Link to="/profile" className='content-element-margin'>
                  Profile
                </Link>
              )}
            </div>
          </div>
          <div className='about'>
            <h3>À propos</h3>
            <div className='about-content content-padding content-direction'>
              <a href="https://bsilva.ch/" className='content-element-margin'>Portfolio</a>
            </div>
          </div>
          <div className='contact'>
            <h3>Contact</h3>
            <div className='contact-content content-padding content-direction'>
              <p className='content-element-margin'>Tel: <a href="tel:+41784031610">078 403 16 10</a></p>
              <p className='content-element-margin'>Email: <a href="mailto:bruno@bsilva.ch">bruno@bsilva.ch</a> </p>
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
