function sendData(form, method, _location, options = {reload: false, _close: true}) {
    const XHR = new XMLHttpRequest(),
          FD = new FormData(form);
    XHR.addEventListener("load", event => {
        try {
            let response = JSON.parse(event.target.responseText);
            if (response.success === true) {
                alert(response.message);
                if (!options.args) options.args = [];

                if (options.onComplete) {
                    if (Array.isArray(options.onComplete)) {
                        options.onComplete.forEach(function (func) {
                            try {
                                func(response)
                            } catch (error) {
                                console.log(error);
                            };
                        })
                    } else options.onComplete(...options.args);
                };

                if      (options.reload)   window.location.reload();
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
    XHR.addEventListener("error", function () {alert('Something went wrong.')});
    XHR.open(method, _location);
    XHR.send(FD);
};