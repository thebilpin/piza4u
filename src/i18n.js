import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en.json";
import translationHI from "./locales/hi.json";
import translationAR from "./locales/ar.json";
import translationFR from "./locales/fr.json"
import { store } from "@/store/store";

let currentLanguage = store.getState().language.value; // Get the initial language value
let unsubscribe = null; // Initialize unsubscribe variable

// Subscribe to the Redux store updates
unsubscribe = store.subscribe(() => {
  const newLanguage = store.getState().language.value;
  if (newLanguage !== currentLanguage) {
    currentLanguage = newLanguage;
    i18n.changeLanguage(newLanguage); // Update the i18n instance with the new language
  }
});

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    hi: { translation: translationHI },
    ar: { translation: translationAR },
    fr: { translation: translationFR },
  },
  lng: currentLanguage, // Set the initial language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Clean up the subscription when the app unmounts
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
}

export default i18n;
export const languages = {
  en: "English",
  hi: "हिंदी",
  ar: "العربية",
  fr: "Français",
};
