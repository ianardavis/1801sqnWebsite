function buildQuery(options) {
    let queries = [];
    if (!options.action || (options.action !== 'sum' && options.action !== 'count')) {
        if (!options.order) {
            const order = document.querySelector(`#tbl_${ options.table }_head [data-dir]`);
            
            if (order && order.dataset.column && order.dataset.dir) {
                let order_col_parsed = JSON.parse(order.dataset.column);
                options.order = order_col_parsed.concat([order.dataset.dir]);
            };
        };

        if (options.order) queries.push(`order=${ JSON.stringify(options.order)}`);

        try {
            let limit  = document.querySelector(`.limit_${  options.table } .active`),
                offset = document.querySelector(`.offset_${ options.table } .active`);

            if (limit && limit.dataset.value !== 'All') queries.push(`limit=${  JSON.stringify(limit .dataset.value) }`);

            if (offset)                                 queries.push(`offset=${ JSON.stringify(offset.dataset.value) }`);

        } catch (error) {
            console.error(`get.js | buildQuery | ${error}`);

        }
    };
    if (options.where) queries.push(`where=${ JSON.stringify(options.where) }`);
    if (options.like ) queries.push(`like=${  JSON.stringify(options.like) }`);
    if (options.lt   ) queries.push(`lt=${    JSON.stringify(options.lt) }`);
    if (options.gt   ) queries.push(`gt=${    JSON.stringify(options.gt) }`);
    return queries;
};
function parseEvent(event) {
    return new Promise((resolve, reject) => {
        if (!event) {
            reject(new Error('No event'));

        } else if (!event.target) {
            reject(new Error('No target'));

        } else if (!event.target.responseText) {
            reject(new Error('No response'));

        } else if (typeof event.target.responseText !== 'string') {
            reject(new Error('No valid response'));

        } else {
            try {
                resolve(JSON.parse(event.target.responseText));

            } catch (err) {
                reject(err);
        
            };
            
        };
    });
};
function printError(message, error) {
    console.error(`get.js | printError | ${error}`);
    showToast('Notification', message, true);
};
function getStream(streamAction) {
    return function (event) {
        try {
            streamAction(event.target.responseText);
        } catch (error) {
            // printError(`Error with stream request`, response.message || error);
            reject(error);
            
        };
    };
};
function get(options) {
    return new Promise((resolve, reject) => {
        const toastID = showToast(options.location || options.table);
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("loadend",  (event) => hideToast(toastID));
        XHR.addEventListener("progress", (event) => updateToast(toastID, event));
        XHR.addEventListener("error",    (event) => reject());

        if (options.streamAction) {
            XHR.addEventListener("load", getStream(options.streamAction));

        } else {
            XHR.addEventListener("load", function (event) {
                parseEvent(event)
                .then(response => {
                    if (response.success) {
                        if (options.func) {
                            addPageLinks(
                                response.result.count,
                                response.result.limit,
                                response.result.offset,
                                options.table,
                                options.func
                            );
                        };
                        resolve([response.result, options]);

                    } else {
                        reject(new Error(response.message));

                    };
                })
                .catch(err => reject(err));
                // .finally(() => hideToast(toastID));
            });

        };
        
        sendXHR(
            XHR,
            'GET',
            `/${options.action || 'get'}/${options.location || options.table}`,
            {params: buildQuery(options).join('&')}
        );
    });
};
function addFormListener(form_id, method, location, options) {
    getElement(`form_${form_id}`)
    .then(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (
                method.toUpperCase() === 'GET' ||
                options.noConfirm    === true  ||
                confirm('Are you sure?')
            ) sendData(method, location, options, form);
        });
    })
    .catch(err => console.error(`get.js | addFormListener | ${ err.message }`));
};
function sendData(method, location, options, form = null) {
    const toastID = showToast(location);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("loadend", (event) => hideToast(toastID));
    XHR.addEventListener("load",    (event) => {
        parseEvent(event)
        .then(response => {
            if (response.success) {
                if (!options.noConfirmAlert) showToast('Notification', response.message, true);
                
                if ( options.onComplete) {
                    if (Array.isArray(options.onComplete)) {
                        options.onComplete.forEach(func => {
                            if (typeof func === 'function') func(response);
                        });

                    } else {
                        if (typeof options.onComplete === 'function') options.onComplete(response);

                    };
                };
                if (options.redirect) {
                    window.location.assign(options.redirect);

                };
            } else {
                console.error(`get.js | sendData | ${response}`);
                showToast('Error', response.message || 'Ooooopsie', true);

            };
        })
        .catch(err => {
            printError('Error parsing response', err);
        });
        // .finally(() => hideToast(toastID));
    });
    
    sendXHR(XHR, method, location, (form ? { form: form } : null));
};
function sendXHR(XHR, method, path, options = {}) {
    XHR.addEventListener("error", function (event) {
        printError('Error with request', event);
        showToast('Error', 'Error with request', true);
    });
    XHR.open(method, `${path}?${ options.params || '' }`);

    let FD = null;
    if (options.form) FD = new FormData(options.form);
    XHR.send(FD);
};