import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Language, Translations } from './types';
import { zh } from './locales/zh';
import { en } from './locales/en';
import { LocalStorageDB } from '../store/local-storage-db';

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  translations: Translations;
  t: <T = string>(path: string, fallback?: string) => T;
}

export const I18nContext = createContext<I18nContextType | null>(null);

const LOCALE_MAP: Record<Language, Translations> = {
  zh,
  en,
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return LocalStorageDB.getLanguage();
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    LocalStorageDB.saveLanguage(newLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang === 'zh' ? 'zh-CN' : 'en';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    }
  }, [language]);

  const currentTranslations = useMemo(() => LOCALE_MAP[language] || zh, [language]);

  // 支持点路径取值：t('header.syncInbound') 或 t('common.save')
  const t = <T = string,>(path: string, fallback?: string): T => {
    const keys = path.split('.');
    let current: any = currentTranslations;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return (fallback || path) as unknown as T;
      }
    }
    return current as T;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        translations: currentTranslations,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export { useI18n } from './useI18n';
