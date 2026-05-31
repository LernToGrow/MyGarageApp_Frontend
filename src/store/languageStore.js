import { create } from 'zustand';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import mr from '../i18n/mr.json';

const TRANSLATIONS = { en, hi, mr };

const saved = localStorage.getItem('garage_lang') || 'en';

export const useLanguageStore = create((set) => ({
  lang: saved,
  translations: TRANSLATIONS[saved] ?? en,

  setLang(lang) {
    const translations = TRANSLATIONS[lang] ?? en;
    localStorage.setItem('garage_lang', lang);
    set({ lang, translations });
  },
}));
