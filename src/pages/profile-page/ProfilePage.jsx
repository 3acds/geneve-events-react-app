// React imports
import React, { useEffect, useRef, useState } from 'react';
// Context imports
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
// Firebase imports
import { getDatabase, ref, update } from 'firebase/database';
// Component imports
import AuthModal from '../../components/authentication/auth-modal/AuthModal';
// CSS imports
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useLanguage();
  const loginNotificationShown = useRef(false);
  const [displayName, setDisplayName] = useState(user ? user.displayName : '');
  const [photoURL, setPhotoURL] = useState(user ? user.photoURL : '');
  const [isEditing, setIsEditing] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    if (!user && !loginNotificationShown.current) {
      loginNotificationShown.current = true;
      showNotification(t('profile.loginRequired'), 'error');
    } else if (user) {
      loginNotificationShown.current = false;
    }
  }, [showNotification, t, user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    setModalData({
      message: t('profile.confirmSave'),
      onConfirm: updateProfile,
      onCancel: closeModal,
      confirmText: t('profile.save'),
      cancelText: t('common.cancel'),
    });
  };

  const closeModal = () => {
    setModalData(null);
  };

  const updateProfile = async () => {
    try {
      const db = getDatabase();
      const userRef = ref(db, 'users/' + user.uid);
      await update(userRef, {
        displayName,
        photoURL,
      });
      const updatedUser = { ...user, displayName, photoURL };
      setUser(updatedUser);
      showNotification(t('notifications.profileUpdated'), 'success');
      setIsEditing(false);
      closeModal();
    } catch (error) {
      // console.error('Failed to update profile:', error);
      showNotification(t('notifications.profileUpdateFailed'), 'error');
    }
  };

  if (!user) {
    return <div>{t('profile.loginRequired')}</div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-page-content">
        <h1>{t('profile.title')}</h1>
        <div className="profile-picture">
          <label htmlFor="fileInput">
            <img src={photoURL} alt={t('profile.avatarAlt')} className="editable-avatar" />
          </label>
          {isEditing && (
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          )}
        </div>
        <div className="profile-details">
          <h2>{displayName}</h2>
          {isEditing && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('profile.displayNamePlaceholder')}
            />
          )}
        </div>
        {isEditing ? (
          <button type="button" onClick={handleSaveClick}>{t('profile.save')}</button>
        ) : (
          <button type="button" onClick={handleEditClick}>{t('profile.edit')}</button>
        )}
        {modalData && (
          <AuthModal
            message={modalData.message}
            onConfirm={modalData.onConfirm}
            onCancel={modalData.onCancel}
            confirmText={modalData.confirmText}
            cancelText={modalData.cancelText}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
