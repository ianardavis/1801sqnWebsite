getSettings = (setting, onComplete, spinner = 'settings') => {
    show_spinner(spinner);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) onComplete(response.settings)
        else alert('Error: ' + response.error);
        hide_spinner(spinner);
    });
    XHR_send(XHR, spinner, '/stores/get/settings?_name=' + setting);
};