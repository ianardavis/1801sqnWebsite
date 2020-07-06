getFiles = (onComplete, query = [], selected = -1) => {
    show_spinner('files');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) onComplete(response.files, selected);
        else alert('Error: ' + response.error);
        hide_spinner('files');
    });
    XHR_send(XHR, 'files', `/stores/get/files?${query.join('&')}`);
};