import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import es from './translations/es.json';
import en from './translations/en.json';
import zh from './translations/zh.json';
import ja from './translations/ja.json';
import fr from './translations/fr.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
  zh: { translation: zh },
  ja: { translation: ja },
  fr: { translation: fr },
};

const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem('appLanguage');
    if (lang && Object.keys(resources).includes(lang)) {
      return lang;
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
  return 'es'; 
};

const initI18n = async () => {
  const language = await getStoredLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'es',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

initI18n();

export const changeLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem('appLanguage', lang);
    await i18n.changeLanguage(lang);
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

export const getCurrentLanguage = () => i18n.language;

export const getAvailableLanguages = () => {
  return [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];
};

export const getNumberSystem = (lang: string) => {
  const systems: { [key: string]: { [key: string]: string } } = {
    es: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9' },
    en: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9' },
    zh: { '0': '〇', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九' },
    ja: { '0': '〇', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九' },
    fr: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9' },
  };
  return systems[lang] || systems.es;
};

export default i18n;