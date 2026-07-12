// React imports
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Context imports
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useNotification } from '../../../context/NotificationContext';
// Component imports
import LoginBtn from '../login/LoginBtn';
import SignUpBtn from '../signup/SignUpBtn';
// CSS imports
import './DropdownMenu.css';

const DropdownMenu = () => {
  const { user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false); 
  const { showNotification } = useNotification();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Dropdown menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to handle user logout
  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsPersisting(false); 
    if (location.pathname === '/profile') {
      navigate('/');
    }
    showNotification(t('notifications.signedOut'), 'success');
  };

  // Function to close the dropdown menu when clicking outside
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
      setIsPersisting(false); 
    }
  };

  // Close dropdown menu when Google Auth popup appears
  const handleAuthInitiate = () => {
    setIsOpen(false);
    setIsPersisting(true);
  };

  const handleAuthEnd = () => {
    setIsOpen(false);
    setIsPersisting(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Function to navigate to the profile page
  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
    setIsPersisting(false);
  };

  // Function to navigate to the home page
  const handleHomeClick = () => {
    navigate('/');
    setIsOpen(false);
    setIsPersisting(false);
  };

  return (
    <div className="dropdown-menu" ref={dropdownRef}>
      <button
        className="account-toggle"
        type="button"
        aria-label={t('auth.menu.accountAria')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        {user ? (
          <>
            <img src={user.photoURL} alt={t('auth.avatarAlt')} className="avatar" />
            <span className="account-label">{user.displayName}</span>
          </>
        ) : (
          <>
            <svg className="account-guest-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5"></circle>
              <path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6"></path>
            </svg>
            <span className="account-label">{t('auth.menu.login')}</span>
          </>
        )}
        <span className="account-toggle-chevron" aria-hidden="true">▼</span>
      </button>
      <div className={`dropdown-content ${isOpen ? 'show' : ''} ${isPersisting ? 'persist' : ''}`}>
        {user ? (
          <>
            {location.pathname !== '/profile' ? (
              <button type="button" onClick={handleProfileClick}>{t('auth.menu.profile')}</button>
            ) : (
              <button type="button" onClick={handleHomeClick}>{t('auth.menu.home')}</button>
            )}
            <button type="button" onClick={handleLogout}>{t('auth.menu.logout')}</button>
          </>
        ) : (
          <>
            <LoginBtn onLogin={(user) => {
              login(user);
              setIsOpen(false);
              setIsPersisting(false); 
            }} onAuthInitiate={handleAuthInitiate} onAuthEnd={handleAuthEnd} />
            <SignUpBtn onRegister={(user) => {
              login(user);
              setIsOpen(false);
              setIsPersisting(false); 
            }} onAuthInitiate={handleAuthInitiate} onAuthEnd={handleAuthEnd} />
          </>
        )}
      </div>
    </div>
  );
};

export default DropdownMenu;
