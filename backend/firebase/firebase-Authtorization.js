const firebaseConfig = {
    apiKey: "AIzaSyAoscFK4oy5Y88QA5FiN3SMIn4-6xI09_w",
    authDomain: "melanis-f4597.firebaseapp.com",
    projectId: "melanis-f4597",
    storageBucket: "melanis-f4597.firebasestorage.app",
    messagingSenderId: "454774406950",
    appId: "1:454774406950:web:26ea970b11d48d827f4be7",
    measurementId: "G-88CGTQR4CX"
};

    if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
let confirmationResult;

window.onload = function () {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal', 
        'callback': (response) => { /* reCAPTCHA готова */ }
    });
    recaptchaVerifier.render();
};