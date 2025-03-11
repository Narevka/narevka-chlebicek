
/**
 * Utility functions for language detection and handling
 */

// Detect language based on request headers or explicit parameter
export const detectLanguage = (request: Request): string => {
  // Check for language parameter in the request query
  const url = new URL(request.url);
  const paramLanguage = url.searchParams.get('language');
  
  if (paramLanguage && ['pl', 'en'].includes(paramLanguage)) {
    return paramLanguage;
  }
  
  // Get Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language') || '';
  
  // Standard code for detecting language preferences
  const preferredLanguages = acceptLanguage
    .split(',')
    .map(lang => {
      const [language, qValue] = lang.trim().split(';q=');
      return {
        language: language.split('-')[0], // Extract main language code (pl-PL -> pl)
        quality: qValue ? parseFloat(qValue) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);
  
  // Default language is English if no preferences detected
  if (preferredLanguages.length === 0) return 'en';
  
  // Get preferred language
  const detectedLanguage = preferredLanguages[0].language;
  
  // Currently we support Polish and English
  return ['pl', 'en'].includes(detectedLanguage) ? detectedLanguage : 'en';
};

// Get system instructions based on language
export const getLanguageInstructions = (userLanguage: string): string => {
  if (userLanguage === 'pl') {
    return 'Proszę odpowiadać po polsku. Użytkownik oczekuje komunikacji w języku polskim.';
  } else if (userLanguage === 'en') {
    return 'Please respond in English. The user expects communication in English.';
  }
  return '';
};
