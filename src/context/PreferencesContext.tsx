import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Language, type Theme, translations, type TranslationKey } from '../utils/translations';

interface PreferencesContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const LANGUAGE_KEY = 'van_nyay_language';
const THEME_KEY = 'van_nyay_theme';

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (stored === 'hi' || stored === 'en') return stored;
    } catch {
      // ignore
    }
    return 'en';
  });

  // Initialize theme from localStorage or default to 'light'
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    return 'light';
  });

  // Apply theme to DOM and persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply language to DOM and persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTheme = (thm: Theme) => {
    setThemeState(thm);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (key in langDict) {
      return (langDict as any)[key];
    }
    const fallbackDict = translations.en;
    if (key in fallbackDict) {
      return (fallbackDict as any)[key];
    }
    return fallback || key;
  };

  return (
    <PreferencesContext.Provider
      value={{
        language,
        theme,
        setLanguage,
        setTheme,
        toggleLanguage,
        toggleTheme,
        t,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
