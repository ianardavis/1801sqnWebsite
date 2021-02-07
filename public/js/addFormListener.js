function addFormListener(form_id, method, location, options = {reload: false, _close: true}, log = false) {
    try {
        let form = document.querySelector(`#form_${form_id}`);
        if (form) {
            let submit_func = function (event) {
                event.preventDefault();
                if (
                    method.toUpperCase() === 'GET' ||
                    options.noConfirm === true     ||
                    confirm('Are you sure?')
                ) sendData(form, method, location, options);
            };
            form.addEventListener("submit", submit_func);
            if (log) event_listeners.push({id: form_id, function: submit_func});
        } else console.log(`${form_id} not found`);
    } catch (error) {
        console.log(`Error on form: ${form_id}`, error, )
    };
};
function sendData(form, method, _location, options = {reload: false, _close: true}) {
    const XHR = new XMLHttpRequest(),
          FD  = new FormData(form);
    XHR.addEventListener("load", function (event) {
        try {
            let response = JSON.parse(event.target.responseText);
            if (response.success === true) {
                if (!options.noConfirmAlert) alert(response.message);
                if (options.onComplete) {
                    if (Array.isArray(options.onComplete)) {
                        options.onComplete.forEach(func => {
                            try {
                                // func(response)
                                func()
                            } catch (error) {
                                console.log(error);
                            };
                        })
                    } else {
                        try {
                            options.onComplete();
                        } catch (error) {
                            console.log(error);
                        };
                    };
                };

                if      (options.reload)   window.location.reload();
                else if (options._close)   close();
                else if (options.redirect) window.location.replace(options.redirect);
            } else {
                console.log(response);
                alert(response.message || response.error || 'Unknown error');
            };
        } catch (error) {
            console.log(error)
        };
    });
    XHR.addEventListener("error", function (event) {
        console.log(event);
        alert('Something went wrong.');
    });
    XHR.open(method, _location);
    XHR.send(FD);
};