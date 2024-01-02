const storage = sessionStorage;
const keyName = 'cookie_consent';
const showWarning = () => !storage.getItem(keyName);
const saveConsent = () => storage.setItem(keyName, true);

window.addEventListener('load', function () {
    let consent_popup     = document.querySelector('#consent_popup');
    let btn_cookie_accept = document.querySelector('#btn_cookie_accept');
    btn_cookie_accept.addEventListener('click', function() {
        saveConsent();
        consent_popup.classList.add('hidden');
    });
    if (showWarning()) consent_popup.classList.remove('hidden');
})