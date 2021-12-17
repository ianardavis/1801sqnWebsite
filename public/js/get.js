function get(options) {
    return new Promise((resolve, reject) => {
        show_spinner(options.spinner || options.table || '');
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", function (event) {
            hide_spinner(options.spinner || options.table || '');
            if      (!event)                                        reject(new Error('No event'))
            else if (!event.target)                                 reject(new Error('No target'))
            else if (!event.target.responseText)                    reject(new Error('No response'))
            else if (typeof event.target.responseText !== 'string') reject(new Error('No valid response'))
            else {
                try {
                    if (options.streamAction) {
                        options.streamAction(event.target.responseText)
                    } else {
                        let response = JSON.parse(event.target.responseText);
                        if (response.success) resolve([response.result, options])
                        else {
                            console.log(`********* Error getting ${options.table} *********`);
                            console.log(response.message || response);
                            console.log('*******************************************');
                            reject(new Error(response.message));
                        };
                    };
                } catch (error) {
                    console.log(`********* Error getting ${options.table} *********`);
                    console.log(error);
                    console.log('*******************************************');
                    reject(error);
                };
            };
        });
        XHR.addEventListener("error", function (event) {
            XHR_Error(event, 'getting', options.spinner || options.table || '');
            reject(event);
        });
        let queries = [];
        if (options.where )  queries.push(`where=${JSON.stringify(options.where)}`);
        if (options.like  )  queries.push(`like=${ JSON.stringify(options.like)}`);
        if (options.lt    )  queries.push(`lt=${   JSON.stringify(options.lt)}`);
        if (options.gt    )  queries.push(`gt=${   JSON.stringify(options.gt)}`);
        if (options.order )  queries.push(`order={"col":"${options.order.col}","dir":"${options.order.dir}"}`);
        if (options.limit )  queries.push(`limit=${ options.limit}`);
        if (options.offset)  queries.push(`offset=${options.offset}`);

        if (options.filter)  queries.push(`filter=${options.filter}`);
        if (options.query )  queries.push(`where={${options.query.join(',')}}`);
        if (options.sort  )  queries.push(`sort=${JSON.stringify(options.sort)}`);
        XHR.open(options.method || 'GET', `/get/${options.table}?${queries.join('&')}`);
        XHR.send();
    });
};
function count(options) {
    return new Promise((resolve, reject) => {
        show_spinner(options.spinner || options.table || '');
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", function (event) {
            hide_spinner(options.spinner || options.table || '');
            if      (!event)                                        reject(new Error('No event'))
            else if (!event.target)                                 reject(new Error('No target'))
            else if (!event.target.responseText)                    reject(new Error('No response'))
            else if (typeof event.target.responseText !== 'string') reject(new Error('No valid response'))
            else {
                try {
                    let response = JSON.parse(event.target.responseText);
                    if (response.success === true) resolve([response.result || 0, options])
                    else {
                        console.log(`********* Error counting ${options.table} *********`);
                        console.log(response.message || response);
                        console.log('*******************************************');
                        reject(new Error(response.message));
                    };
                } catch (error) {
                    console.log(`********* Error counting ${options.table} *********`);
                    console.log(error);
                    console.log('*******************************************');
                    reject(error);
                };
            };
        });
        XHR.addEventListener("error", function (event) {
            XHR_Error(event, 'counting', options.spinner || options.table || '');
            reject(event);
        });
        XHR.open('GET', `/count/${options.table}?${options.query.join('&')}`);
        XHR.send();
    });
};
function sum(options) {
    return new Promise((resolve, reject) => {
        show_spinner(options.spinner || options.table || '');
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", function (event) {
            hide_spinner(options.spinner || options.table || '');
            if      (!event)                                        reject(new Error('No event'))
            else if (!event.target)                                 reject(new Error('No target'))
            else if (!event.target.responseText)                    reject(new Error('No response'))
            else if (typeof event.target.responseText !== 'string') reject(new Error('No valid response'))
            else {
                try {
                    let response = JSON.parse(event.target.responseText);
                    if (response.success === true) resolve([response.result || 0, options])
                    else {
                        console.log(`********* Error summing ${options.table} *********`);
                        console.log(response.message || response);
                        console.log('*******************************************');
                        reject(new Error(response.message));
                    };
                } catch (error) {
                    console.log(`********* Error summing ${options.table} *********`);
                    console.log(error);
                    console.log('*******************************************');
                    reject(error);
                };
            };
        });
        XHR.addEventListener("error", function (event) {
            XHR_Error(event, 'summing', options.spinner || options.table || '');
            reject(event);
        });
        XHR.open('GET', `/sum/${options.table}?${options.query.join('&')}`);
        XHR.send();
    });
};

function addFormListener(form_id, method, location, options = {reload: false}) {
    try {
        let form = document.querySelector(`#form_${form_id}`);
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                if (options.spinner) show_spinner(options.spinner);
                if (
                    method.toUpperCase() === 'GET' ||
                    options.noConfirm    === true  ||
                    confirm('Are you sure?')
                ) sendData(form, method, location, options);
            });
        } else console.log(`${form_id} not found`);
    } catch (error) {
        console.log(`Error on form: ${form_id}. `, error)
    };
};
function sendData(form, method, _location, options = {reload: false}) {
    const XHR = new XMLHttpRequest(),
          FD  = new FormData(form);
    XHR.addEventListener("load", function (event) {
        try {
            let response = JSON.parse(event.target.responseText);
            if (response.success === true) {
                if (!options.noConfirmAlert) alert_toast(response.message);
                if (options.onComplete) {
                    if (Array.isArray(options.onComplete)) {
                        options.onComplete.forEach(func => {
                            try {
                                if (typeof func === 'function') func(response)
                            } catch (error) {
                                console.log(error);
                            };
                        })
                    } else {
                        try {
                            if (typeof options.onComplete === 'function') options.onComplete(response);
                        } catch (error) {
                            console.log(error);
                        };
                    };
                };
                if      (options.reload)   window.location.reload();
                else if (options.redirect) window.location.assign(options.redirect);
            } else {
                if (options.onFail) {
                    if (Array.isArray(options.onFail)) {
                        options.onFail.forEach(func => {
                            try {
                                func()
                            } catch (error) {
                                console.log(error);
                            };
                        })
                    } else {
                        try {
                            options.onFail();
                        } catch (error) {
                            console.log(error);
                        };
                    };
                };
                console.log(response);
                alert_toast(response.message || response.error || 'Unknown error');
            };
        } catch (error) {
            console.log(error)
        };
    });
    XHR.addEventListener("error", function (event) {
        console.log(event);
        alert_toast('Something went wrong.');
    });
    XHR.open(method, _location);
    XHR.send(FD);
};
function XHR_Error(event, action, spinner) {
    console.log(`********* Error ${action} ${options.table} *********`);
    console.log(event);
    console.log('*******************************************');
    hide_spinner(spinner);
    reject(event);
};