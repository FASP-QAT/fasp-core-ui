import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

// import en from '/';
import en from '../src/assets/img/locales/en.json'
import fr from '../src/assets/img/locales/fr.json';
import pr from '../src/assets/img/locales/pr.json';
import sp from '../src/assets/img/locales/sp.json';

import { initReactI18next } from 'react-i18next';
import { isSiteOnline } from './CommonComponent/JavascriptCommonFunctions.js';
//import moment from 'moment';
var lang = localStorage.getItem('lang');
if (lang == null) {
  lang = 'en';
  localStorage.setItem('lang', lang);

}
isSiteOnline(function (found) {
i18n
  .use(LanguageDetector)
  .use(Backend)
  .use(initReactI18next)
  .init({
    
    lng: lang,
    backend: {
      /* translation file path */
      // loadPath: '/locales/{{lng}}.json',
      loadPath: 
        found ? '../src/assets/img/locales/{{lng}}.json' : '/{{lng}}.json',
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
    }, debug: true,
    useSuspense: true,
    wait: true,
  }, (err, t) => {
    if (err) return console.log('something went wrong loading', err);
    t('key'); // -> same as i18next.t
  }
  )
}.bind(this))
i18n.loadNamespaces('translations', (err, t) => { console.log('something went wrong loading', err); /* ... */ });
i18n.on('languageChanged initialized', () => {
  if (!i18n.isInitialized) return;
  // if (i18n.options && i18n.options.second) {
  //   // seems 2nd init was done
  // }
});
export default i18n;