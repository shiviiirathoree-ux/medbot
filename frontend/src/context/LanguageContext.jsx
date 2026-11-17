import { createContext, useContext, useState, useEffect } from 'react'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import es from '../i18n/es.json'
import fr from '../i18n/fr.json'
import ar from '../i18n/ar.json'
import bn from '../i18n/bn.json'

const translations = { en, hi, es, fr, ar, bn }

const LANGUAGES = [
  { code: 'en', name: 'English',  flag: '🇺🇸', dir: 'ltr' },
  { code: 'hi', name: 'हिंदी',    flag: '🇮🇳', dir: 'ltr' },
  { code: 'es', name: 'Español',  flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية',  flag: '🇸🇦', dir: 'rtl' },
  { code: 'bn', name: 'বাংলা',    flag: '🇧🇩', dir: 'ltr' },
]

const LanguageContext = createContext(null)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en')

  const t = (key) => {
    const keys = key.split('.')
    let val = translations[language]
    for (const k of keys) { val = val?.[k] }
    return val || translations['en'][key] || key
  }

  const changeLanguage = (code) => {
    setLanguage(code)
    localStorage.setItem('language', code)
    const lang = LANGUAGES.find(l => l.code === code)
    document.documentElement.dir = lang?.dir || 'ltr'
    document.documentElement.lang = code
  }

  useEffect(() => {
    const lang = LANGUAGES.find(l => l.code === language)
    document.documentElement.dir = lang?.dir || 'ltr'
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
