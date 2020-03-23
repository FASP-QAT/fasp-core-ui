export default function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        console.log("register service worker");
        navigator.serviceWorker.register(`faspsw.js`).then(function (register) {
            console.log("It worked for me");
        }).catch(function (err) {
            console.log("Error", err)
        })
    }else{
        console.log("service worker already registered");
    }
}
