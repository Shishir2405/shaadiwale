export const SUPPORTED_LANGUAGES = {
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  mr: 'Marathi',
  gu: 'Gujarati',
  bn: 'Bengali',
  pa: 'Punjabi'
};

export const initGoogleTranslate = () => {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=TranslateInit";
      script.onerror = () => reject(new Error('Failed to load Google Translate script'));
      document.body.appendChild(script);

      window.TranslateInit = () => {
        try {
          const translateElement = new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "hi,ta,te,ml,kn,mr,gu,bn,pa",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            "google_translate_element"
          );
          resolve(translateElement);
        } catch (error) {
          reject(error);
        }
      };
    } catch (error) {
      reject(error);
    }
  });
};