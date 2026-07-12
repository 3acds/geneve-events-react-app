// React imports
import React, { useState } from 'react';
// Firebase imports
import { signInWithPopup } from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth, googleProvider } from '../../../services/database/firebase';
// Context imports
import { useNotification } from '../../../context/NotificationContext';
import { useLanguage } from '../../../context/LanguageContext';
// Component imports
import AuthModal from '../auth-modal/AuthModal';
import GoogleIcon from '../GoogleIcon';

const SignUpBtn = ({ onRegister, onAuthInitiate = () => {}, onAuthEnd = () => {} }) => {
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();
  const { t } = useLanguage();

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    onAuthInitiate();
    try {
      // Google sign in
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const db = getDatabase();
      const userRef = ref(db, 'users/' + user.uid);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        // console.log('User already exists, showing modal');
        setModalData({
          message: t('auth.signup.accountExistsPrompt'),
          onConfirm: () => {
            const updatedUser = {
              ...user,
              displayName: userData.displayName || user.displayName,
              photoURL: userData.photoURL || user.photoURL,
            };
            // console.log('Logging in existing user:', updatedUser);
            onRegister(updatedUser);
            showNotification(t('notifications.signedIn'), 'success');
            closeModal();
          },
          onCancel: () => {
            // console.log('User canceled login');
            closeModal();
          },
          confirmText: t('auth.action.signIn'),
          cancelText: t('common.cancel')
        });
      } else {
        // console.log('User does not exist, creating account');
        await set(userRef, {
          username: user.displayName,
          email: user.email,
          profile_picture: user.photoURL,
          displayName: user.displayName,
          photoURL: user.photoURL,
          loginAttempts: 0,
          accountType: 'google'
        });
        onRegister(user);
        showNotification(t('notifications.accountCreated'), 'success');
      }
    } catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        showNotification(t('notifications.googleSignUpFailed'), 'error');
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
      <button className="google-auth-button" type="button" onClick={handleGoogleSignUp} disabled={isLoading}>
        <GoogleIcon />
        <span>{isLoading ? t('auth.signup.loading') : t('auth.signup.withGoogle')}</span>
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

export default SignUpBtn;
