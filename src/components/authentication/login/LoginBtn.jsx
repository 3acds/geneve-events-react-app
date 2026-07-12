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
import { useNotification } from '../../../context/NotificationContext';

const LoginBtn = ({ onLogin, onAuthInitiate = () => {}, onAuthEnd = () => {} }) => {
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

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
        showNotification('Connecté avec succès', 'success');
      } else {
        setModalData({
          message: "Le compte n'existe pas. Voulez-vous vous inscrire?",
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
            showNotification('Votre compte a été créé avec succès! Merci de vous être inscrit chez nous.', 'success');
            closeModal();
          },
          onCancel: () => {
            // console.log('User canceled registration');
            closeModal();
          },
          confirmText: "S'inscrire",
          cancelText: 'Annuler'
        });
        // console.log('Modal data set:', modalData); 
      }
    } catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        showNotification("L'authentification Google a échoué. Veuillez réessayer.", 'error');
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
      <button className="google-auth-button" onClick={handleGoogleSignIn} disabled={isLoading}>
        <GoogleIcon />
        <span>{isLoading ? 'Connexion…' : 'Se connecter avec Google'}</span>
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
