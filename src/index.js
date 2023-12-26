// import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support
import 'react-app-polyfill/stable';
import './polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './i18n';
import App from './App';

import favicon from '../src/assets/img/favicon.ico';
import manifest from '../src/assets/img/manifest.json';
import img192 from '../src/assets/img/QAT-logo192x192.png';
import img512 from '../src/assets/img/QAT-logo512x512.png';
import registerServiceWorker from './serviceWorkerDev.js';
import { getDatabase } from "../src/CommonComponent/IndexedDbFunctions";
import { saveProgram } from '../src/CommonComponent/IndexedDbFunctions';
const loading = () => <div className="animated fadeIn pt-3 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;


ReactDOM.render(<React.Suspense fallback={loading()}><App /></React.Suspense>, document.getElementById('root'));
getDatabase();
registerServiceWorker();
