import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  CATEGORY_MESSAGE_KEYS,
  DEFAULT_LANGUAGE,
  LANGUAGE_LOCALES,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  translateMessage,
} from '../i18n/translations';

const defaultTranslate = (key, variables) => translateMessage(DEFAULT_LANGUAGE, key, variables);
const defaultCategoryLabel = (apiTag, fallback = apiTag) => {
  const messageKey = CATEGORY_MESSAGE_KEYS[apiTag];
  return messageKey ? defaultTranslate(messageKey) : fallback;
};

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  locale: LANGUAGE_LOCALES[DEFAULT_LANGUAGE],
  languages: LANGUAGE_OPTIONS,
  setLanguage: () => {},
  t: defaultTranslate,
  getCategoryLabel: defaultCategoryLabel,
});

const getSavedLanguage = () => {
  if (typeof window === 'undefined') return null;

  try {
    return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
};

const getBrowserLanguage = () => {
  if (typeof navigator === 'undefined') return null;
  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const browserLanguage of browserLanguages) {
    const supportedLanguage = normalizeLanguage(browserLanguage);
    if (supportedLanguage) return supportedLanguage;
  }

  return null;
};

const getInitialLanguage = (initialLanguage) => (
  normalizeLanguage(initialLanguage)
  || getSavedLanguage()
  || getBrowserLanguage()
  || DEFAULT_LANGUAGE
);

export const LanguageProvider = ({ children, initialLanguage }) => {
  const [language, setLanguageState] = useState(() => getInitialLanguage(initialLanguage));
  const locale = LANGUAGE_LOCALES[language];

  const setLanguage = useCallback((nextLanguage) => {
    const supportedLanguage = normalizeLanguage(nextLanguage);
    if (supportedLanguage) setLanguageState(supportedLanguage);
  }, []);

  const t = useCallback(
    (key, variables) => translateMessage(language, key, variables),
    [language],
  );

  const getCategoryLabel = useCallback((apiTag, fallback = apiTag) => {
    const messageKey = CATEGORY_MESSAGE_KEYS[apiTag];
    return messageKey ? t(messageKey) : fallback;
  }, [t]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Language switching still works when persistent storage is unavailable.
    }

    document.documentElement.lang = locale;
    document.title = t('meta.title');
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', t('meta.description'));
  }, [language, locale, t]);

  const value = useMemo(() => ({
    language,
    locale,
    languages: LANGUAGE_OPTIONS,
    setLanguage,
    t,
    getCategoryLabel,
  }), [getCategoryLabel, language, locale, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
