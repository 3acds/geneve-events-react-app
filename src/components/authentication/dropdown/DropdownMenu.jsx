// React imports
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Context imports
import { useAuth } from '../../../context/AuthContext';
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
    showNotification('Déconnecté avec succès', 'success');
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
      <button onClick={toggleMenu}>
        {user ? (
          <>
            <img src={user.photoURL} alt="avatar" className="avatar" />
            {user.displayName}
          </>
        ) : (
          'Connexion'
        )}
        <span style={{ marginLeft: '8px' }}>▼</span>
      </button>
      <div className={`dropdown-content ${isOpen ? 'show' : ''} ${isPersisting ? 'persist' : ''}`}>
        {user ? (
          <>
            {location.pathname !== '/profile' ? (
              <button onClick={handleProfileClick}>Profile</button>
            ) : (
              <button onClick={handleHomeClick}>Home</button>
            )}
            <button onClick={handleLogout}>Logout</button>
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
