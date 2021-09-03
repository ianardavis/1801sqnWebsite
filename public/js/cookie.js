const storage = sessionStorage,
      keyName = 'cookie_consent',
      showWarning = () => !storage.getItem(keyName),
      saveConsent = () => storage.setItem(keyName, true);

window.addEventListener('load', function () {
    let consent_popup     = document.querySelector('#consent_popup'),
        btn_cookie_accept = document.querySelector('#btn_cookie_accept');
    btn_cookie_accept.addEventListener('click', function() {
        saveConsent();
        consent_popup.classList.add('hidden');
    });
    if (showWarning()) {
        consent_popup.classList.remove('hidden');
    };
})