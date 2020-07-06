sendData = (form, method, _location, options = {reload: false, reload_opener: true, _close: true}) => {
    const XHR = new XMLHttpRequest(),
          FD = new FormData(form);
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            alert(response.message);
            if (!options.args) options.args = [];
            if (options.onComplete)    options.onComplete(...options.args);
            if (options.reload_opener) window.opener.location.reload();
            if (options.reload)        window.location.reload();
            else if (options._close)   close();
            else if (options.redirect) window.location.replace(options.redirect);
        } else alert('Error: ' + response.error);
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong.'));
    XHR.open(method, _location);
    XHR.send(FD);
};