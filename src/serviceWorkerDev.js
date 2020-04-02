export default function registerServiceWorker() {
    // Check that service workers are supported
    if ('serviceWorker' in navigator) {
        // Use the window load event to keep the page load performant
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(`faspsw.js`).then(function (register) {
            }).catch(function (err) {
                console.log("Error", err)
            })
        });
    } else {
        console.log("service worker not supported");
    }
}
