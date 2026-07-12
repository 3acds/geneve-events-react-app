// React imports
import React, { useState } from 'react';
// Firebase imports
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../services/database/firebase';
import { getDatabase, ref, get, set } from 'firebase/database';
// Component imports
import AuthModal from '../auth-modal/AuthModal';
import GoogleIcon from '../GoogleIcon';
// Coontext imports
import { useLanguage } from '../../../context/LanguageContext';
import { useNotification } from '../../../context/NotificationContext';

const LoginBtn = ({ onLogin, onAuthInitiate = () => {}, onAuthEnd = () => {} }) => {
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();
  const { t } = useLanguage();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    onAuthInitiate();
    try {
      // console.log('Initiating Google Sign-In');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const db = getDatabase();
      const userRef = ref(db, 'users/' + user.uid);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        // console.log('User exists:', userData);
        // Use custom displayName and photoURL if they exist, otherwise fallback to Google info
        const updatedUser = {
          ...user,
          displayName: userData.displayName || user.displayName,
          photoURL: userData.photoURL || user.photoURL,
        };
        onLogin(updatedUser);
        showNotification(t('notifications.signedIn'), 'success');
      } else {
        setModalData({
          message: t('auth.login.accountMissingPrompt'),
          onConfirm: async () => {
            // console.log('Registering new user:', user);
            await set(userRef, {
              username: user.displayName,
              email: user.email,
              profile_picture: user.photoURL,
              displayName: user.displayName,
              photoURL: user.photoURL,
              loginAttempts: 0,
              accountType: 'google'
            });
            onLogin(user);
            showNotification(t('notifications.accountCreated'), 'success');
            closeModal();
          },
          onCancel: () => {
            // console.log('User canceled registration');
            closeModal();
          },
          confirmText: t('auth.action.signUp'),
          cancelText: t('common.cancel')
        });
        // console.log('Modal data set:', modalData); 
      }
    } catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        showNotification(t('notifications.googleSignInFailed'), 'error');
      }
      onAuthEnd();
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalData(null);
    onAuthEnd();
  };

  return (
    <>
      <button className="google-auth-button" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
        <GoogleIcon />
        <span>{isLoading ? t('auth.login.loading') : t('auth.login.withGoogle')}</span>
      </button>
      {modalData && (
        <AuthModal
          message={modalData.message}
          onConfirm={modalData.onConfirm}
          onCancel={modalData.onCancel}
          confirmText={modalData.confirmText}
          cancelText={modalData.cancelText}
        />
      )}
    </>
  );
};

export default LoginBtn;
