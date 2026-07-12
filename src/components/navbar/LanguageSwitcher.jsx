import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, languages, setLanguage, t } = useLanguage();
  const currentLanguage = languages.find(({ code }) => code === language) || languages[0];

  return (
    <label className="language-switcher" title={t('language.selector')}>
      <span className="language-switcher-code" aria-hidden="true">
        {currentLanguage.shortLabel}
      </span>
      <span className="language-switcher-chevron" aria-hidden="true">▾</span>
      <select
        value={language}
        aria-label={t('language.selector')}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {languages.map(({ code, label }) => (
          <option key={code} value={code} lang={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSwitcher;
