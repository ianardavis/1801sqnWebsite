sendData = (form, method, _location, options = {reload: false, reload_opener: true, _close: true}) => {
    const XHR = new XMLHttpRequest(),
          FD = new FormData(form);
    XHR.addEventListener("load", event => {
        try {
            let response = JSON.parse(event.target.responseText);
            if (response.result === true) {
                alert(response.message);
                if (!options.args) options.args = [];
                if (options.onComplete) {
                    if (Array.isArray(options.onComplete)) {
                        options.onComplete.forEach(func => func(response))
                    } else options.onComplete(...options.args);
                };
                if (options.reload_opener) window.opener.location.reload();
                if (options.reload)        window.location.reload();
                else if (options._close)   close();
                else if (options.redirect) window.location.replace(options.redirect);
            } else {
                console.log(response);
                alert(`Error: ${response.message || response.error || 'unknown'}`);
            };
        } catch (error) {
            console.log(error)
        };
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong.'));
    XHR.open(method, _location);
    XHR.send(FD);
};