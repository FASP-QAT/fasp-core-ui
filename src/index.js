// import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support
import 'react-app-polyfill/stable';
import './polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import  './i18n';
import favicon from '../public/favicon.ico';
import manifest from '../public/manifest.json';
import img192 from '../public/QAT-logo192x192.png';
import img512 from '../public/QAT-logo512x512.png';
import registerServiceWorker from './serviceWorkerDev.js';
import { getDatabase } from "../src/CommonComponent/IndexedDbFunctions";
import { saveProgram } from '../src/CommonComponent/IndexedDbFunctions';

ReactDOM.render(<App />, document.getElementById('root'));
getDatabase();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
registerServiceWorker();
