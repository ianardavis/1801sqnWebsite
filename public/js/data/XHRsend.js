XHR_send = (options = {}) => {
    options.XHR.addEventListener("error", event => {
        alert(`Something went wrong getting ${options.table}`)
        hide_spinner(options.spinner || options.table);
    });
    options.XHR.open(options.method || 'GET', options.location);
    options.XHR.send();
};