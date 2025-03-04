"use client";

import { useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies";

const COOKIE_NAME = "googtrans";

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState();
  const [languageConfig, setLanguageConfig] = useState();

  useEffect(() => {
    // Initialize on client side only
    const initializeLanguage = () => {
      const cookies = parseCookies();
      const existingLanguageCookieValue = cookies[COOKIE_NAME];

      let languageValue;
      if (existingLanguageCookieValue) {
        const sp = existingLanguageCookieValue.split("/");
        if (sp.length > 2) {
          languageValue = sp[2];
        }
      }

      // Use default language if no cookie is set
      if (window.__GOOGLE_TRANSLATION_CONFIG__ && !languageValue) {
        languageValue = window.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage;
      }

      if (languageValue) {
        setCurrentLanguage(languageValue);
      }

      // Set language config from window object
      if (window.__GOOGLE_TRANSLATION_CONFIG__) {
        setLanguageConfig(window.__GOOGLE_TRANSLATION_CONFIG__);
      }
    };

    initializeLanguage();
  }, []);

  // Don't render anything if config is not loaded
  if (!currentLanguage || !languageConfig) {
    return null;
  }

  const switchLanguage = (lang) => {
    // Set cookie and reload page
    setCookie(null, COOKIE_NAME, `/auto/${lang}`, {
      path: "/",
      sameSite: "strict",
    });
    window.location.reload();
  };

  return (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={(e) => switchLanguage(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                   rounded-lg px-4 py-2 pr-8 leading-tight focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm font-medium
                   transition-colors duration-200"
      >
        {languageConfig.languages.map((ld) => (
          <option key={ld.name} value={ld.name} className="py-2">
            {ld.title}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export { LanguageSwitcher, COOKIE_NAME };
