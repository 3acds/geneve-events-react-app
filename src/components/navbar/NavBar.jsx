import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import DropdownMenu from '../authentication/dropdown/DropdownMenu';
import categories from '../../pages/home-page/data/static-data.json';
import './Navbar.css';

const Navbar = () => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef(null);
  const categoryPanelRef = useRef(null);
  const location = useLocation();

  const currentCategory = location.pathname.startsWith('/category/')
    ? decodeURIComponent(location.pathname.split('/category/')[1].split('/')[0])
    : null;

  useEffect(() => {
    setIsCategoryMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isCategoryMenuOpen) return undefined;

    const closeMenu = (event) => {
      if (event.key === 'Escape') {
        setIsCategoryMenuOpen(false);
      } else if (
        event.type === 'mousedown'
        && !categoryMenuRef.current?.contains(event.target)
        && !categoryPanelRef.current?.contains(event.target)
      ) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener('keydown', closeMenu);
    document.addEventListener('mousedown', closeMenu);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeMenu);
      document.removeEventListener('mousedown', closeMenu);
      document.body.style.overflow = previousOverflow;
    };
  }, [isCategoryMenuOpen]);

  useEffect(() => {
    // Function to add a class to the navbar when the user scrolls the page 
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) { 
        navbar.classList.add('scroll');
      } else {
        navbar.classList.remove('scroll');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link className="navbar-brand" to="/" aria-label="Geneva Events Explorer — accueil">
        GEE
      </Link>

      <div className="site-navigation" ref={categoryMenuRef}>
        <button
          className="site-navigation-toggle"
          type="button"
          aria-expanded={isCategoryMenuOpen}
          aria-controls="category-navigation-menu"
          onClick={() => setIsCategoryMenuOpen((isOpen) => !isOpen)}
        >
          <span className="navigation-grid-icon" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </span>
          <span className="navigation-label">Explorer</span>
          <span className="navigation-chevron" aria-hidden="true">▾</span>
        </button>

        {isCategoryMenuOpen && createPortal(
          <div className="category-navigation-overlay">
            <nav
              id="category-navigation-menu"
              className="category-navigation-menu"
              ref={categoryPanelRef}
              aria-label="Catégories d'événements"
            >
              <div className="category-navigation-heading">Explorer les événements</div>
              <div className="category-navigation-grid">
                <Link className="category-navigation-link home-link" to="/">
                  Accueil
                </Link>
                {categories.categories.map((category) => (
                  <Link
                    key={category.apiTag}
                    className={`category-navigation-link ${currentCategory === category.apiTag ? 'active' : ''}`}
                    to={`/category/${encodeURIComponent(category.apiTag)}`}
                    state={{
                      displayTag: category.displayTag,
                      cornerColor: category.cornerColor,
                    }}
                    aria-current={currentCategory === category.apiTag ? 'page' : undefined}
                  >
                    <span
                      className="category-navigation-accent"
                      style={{ background: category.cornerColor }}
                      aria-hidden="true"
                    ></span>
                    {category.displayTag}
                  </Link>
                ))}
              </div>
            </nav>
          </div>,
          document.body,
        )}
      </div>

      <DropdownMenu />
    </nav>
  );
};

export default Navbar;
