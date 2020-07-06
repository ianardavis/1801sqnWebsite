XHR_send = (XHR, table, location, method = 'GET') => {
    XHR.addEventListener("error", event => {
        alert('Oops! Something went wrong getting ' + table)
        hide_spinner(table);
    });
    XHR.open(method, location);
    XHR.send();
};