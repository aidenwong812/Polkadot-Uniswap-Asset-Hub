import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "../../translations/en.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: translationEN,
    },
  },
  lng: "en",
  fallbackLng: "en",
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
