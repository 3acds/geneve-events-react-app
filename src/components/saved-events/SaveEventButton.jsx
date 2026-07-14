import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../context/SavedEventsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import './SaveEventButton.css';

const SaveEventButton = ({ eventId, compact = false }) => {
  const { user, authLoading } = useAuth();
  const { saved, pending, hydrate, toggle } = useSavedEvents();
  const { t } = useLanguage();
  const { showNotification } = useNotification();
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (user && eventId) hydrate([eventId]).catch(() => setLoadError(true));
  }, [eventId, hydrate, user]);

  const handleClick = async (clickEvent) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    if (!user) {
      showNotification(t('saved.loginRequired'), 'error');
      return;
    }
    try {
      setLoadError(false);
      await toggle(String(eventId));
    } catch {
      showNotification(t('saved.actionFailed'), 'error');
    }
  };

  const isSaved = Boolean(saved[eventId]);
  const isPending = Boolean(pending[eventId]);
  return <button
    className={`save-event-button ${compact ? 'is-compact' : ''} ${isSaved ? 'is-saved' : ''}`}
    type="button"
    onClick={handleClick}
    disabled={authLoading || isPending}
    aria-pressed={isSaved}
    aria-label={isSaved ? t('saved.remove') : t('saved.save')}
    title={loadError ? t('saved.stateFailed') : undefined}
  >
    <span aria-hidden="true">{isSaved ? '♥' : '♡'}</span>
    {!compact && <span>{isPending ? t('saved.updating') : (isSaved ? t('saved.saved') : t('saved.save'))}</span>}
  </button>;
};

export default SaveEventButton;
