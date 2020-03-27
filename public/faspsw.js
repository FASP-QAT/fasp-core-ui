importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

// import {registerRoute} from 'workbox-routing';
// import {StaleWhileRevalidate} from 'workbox-strategies';
// import {BroadcastUpdatePlugin} from 'workbox-broadcast-update';



console.log('Hello from service-worker.js');
if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.setConfig({
  debug: true
});

// This will work!
workbox.routing.registerRoute(
  new RegExp('\\.(?:js|css|scss|html|gif|svg|jpg|png)'),
  new workbox.strategies.NetworkFirst()
);


