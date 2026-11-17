const logger = require('../utils/logger');

// Google Translate API wrapper (free tier via unofficial endpoint or official API)
const translateText = async (text, targetLang, sourceLang = 'auto') => {
  try {
    if (!process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY === 'your_google_translate_api_key') {
      // Fallback: return original text if no API key
      logger.warn('Google Translate API key not set, returning original text');
      return text;
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target: targetLang, source: sourceLang === 'auto' ? undefined : sourceLang, format: 'text' }),
    });

    if (!response.ok) throw new Error(`Translation API error: ${response.status}`);
    const data = await response.json();
    return data.data?.translations?.[0]?.translatedText || text;
  } catch (error) {
    logger.error(`Translation error: ${error.message}`);
    return text; // fallback to original
  }
};

// Language code mapping
const LANG_MAP = {
  en: 'en', hi: 'hi', es: 'es', fr: 'fr', ar: 'ar', bn: 'bn',
};

exports.translateToEnglish = async (text, sourceLang) => {
  if (sourceLang === 'en') return text;
  return translateText(text, 'en', LANG_MAP[sourceLang] || sourceLang);
};

exports.translateFromEnglish = async (text, targetLang) => {
  if (targetLang === 'en') return text;
  return translateText(text, LANG_MAP[targetLang] || targetLang, 'en');
};

exports.detectLanguage = async (text) => {
  try {
    if (!process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY === 'your_google_translate_api_key') {
      return 'en';
    }
    const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text }),
    });
    const data = await response.json();
    return data.data?.detections?.[0]?.[0]?.language || 'en';
  } catch (error) {
    return 'en';
  }
};
