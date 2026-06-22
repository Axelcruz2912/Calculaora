import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages, getNumberSystem } from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  availableLanguages: { code: string; name: string; flag: string }[];
  getNumberInSystem: (num: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('es');
  const availableLanguages = getAvailableLanguages();

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('appLanguage');
      if (saved) {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: string) => {
    const success = await changeLanguage(lang);
    if (success) {
      setLanguageState(lang);
    }
  };

  // Convertir números al sistema del idioma
  const getNumberInSystem = (num: string): string => {
    const system = getNumberSystem(language);
    return num.split('').map(char => system[char] || char).join('');
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      availableLanguages,
      getNumberInSystem,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};