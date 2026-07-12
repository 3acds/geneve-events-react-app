import React, { useEffect } from 'react';
import GoogleIcon from '../GoogleIcon';
import './AuthModal.css';

const AuthModal = ({ message, onConfirm, onCancel, confirmText, cancelText }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <>
      <div className="auth-modal-overlay" onClick={onCancel}></div>
      <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-message">
        <div className="auth-modal-content">
          <div className="auth-modal-provider"><GoogleIcon /> Authentification Google</div>
          <p id="auth-modal-message">{message}</p>
          <div className="auth-modal-buttons">
            <button onClick={onConfirm}>{confirmText}</button>
            <button onClick={onCancel}>{cancelText}</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
