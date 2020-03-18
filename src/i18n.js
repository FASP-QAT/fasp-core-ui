import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
//import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
//import moment from 'moment';
var lang =localStorage.getItem('lang');
if(lang==null){
  lang='en';
  localStorage.setItem('lang',lang);

}
    i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: lang,
    backend: {
      /* translation file path */
      loadPath: 'http://localhost:8084/api/locales/{{lng}}',
      crossDomain: true
    },
    fallbackLng: 'en',
    debug: true,
    /* can have multiple namespace, in case you want to divide a huge translation into smaller pieces and load them on demand */
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ','
    },
    react: {
      wait: true
    }
  })


  export default i18n;