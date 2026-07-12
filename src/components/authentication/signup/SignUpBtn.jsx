// React imports
import React, { useState } from 'react';
// Firebase imports
import { signInWithPopup } from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth, googleProvider } from '../../../services/database/firebase';
// Context imports
import { useNotification } from '../../../context/NotificationContext';
// Component imports
import AuthModal from '../auth-modal/AuthModal';
import GoogleIcon from '../GoogleIcon';

const SignUpBtn = ({ onRegister, onAuthInitiate = () => {}, onAuthEnd = () => {} }) => {
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

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
          message: 'Le compte existe déjà. Voulez-vous vous connecter?',
          onConfirm: () => {
            const updatedUser = {
              ...user,
              displayName: userData.displayName || user.displayName,
              photoURL: userData.photoURL || user.photoURL,
            };
            // console.log('Logging in existing user:', updatedUser);
            onRegister(updatedUser);
            showNotification('Connecté avec succès', 'success');
            closeModal();
          },
          onCancel: () => {
            // console.log('User canceled login');
            closeModal();
          },
          confirmText: 'Se connecter',
          cancelText: 'Annuler'
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
        showNotification('Votre compte a été créé avec succès! Merci de vous être inscrit chez nous', 'success');
      }
    } catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        showNotification("L'inscription avec Google a échoué. Veuillez réessayer.", 'error');
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
      <button className="google-auth-button" onClick={handleGoogleSignUp} disabled={isLoading}>
        <GoogleIcon />
        <span>{isLoading ? 'Inscription…' : "S'inscrire avec Google"}</span>
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
