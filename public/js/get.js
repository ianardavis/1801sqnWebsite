function build_query(options) {
    let queries = [];
    if (!options.action || (options.action !== 'sum' && options.action !== 'count')) {
        if (!options.order) {
            const order = document.querySelector(`#tbl_${options.table}_head [data-dir]`);
            
            if (order && order.dataset.column && order.dataset.dir) {
                let order_col_parsed = JSON.parse(order.dataset.column);
                options.order = order_col_parsed.concat([order.dataset.dir]);
            };
        };

        if (options.order) queries.push(`order=${ JSON.stringify(options.order)}`);

        try {
            let limit  = document.querySelector(`.limit_${ options.table} .active`),
                offset = document.querySelector(`.offset_${options.table} .active`);

            if (limit && limit.dataset.value !== 'All') queries.push(`limit=${ JSON.stringify(limit .dataset.value)}`);

            if (offset)                                 queries.push(`offset=${JSON.stringify(offset.dataset.value)}`);

        } catch (error) {
            console.error(error);

        }
    };
    if (options.where) queries.push(`where=${JSON.stringify(options.where)}`);
    if (options.like ) queries.push(`like=${ JSON.stringify(options.like)}`);
    if (options.lt   ) queries.push(`lt=${   JSON.stringify(options.lt)}`);
    if (options.gt   ) queries.push(`gt=${   JSON.stringify(options.gt)}`);
    return queries;
};
function eventParse(event) {
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
function print_error(message, error) {
    console.log(`************ message ************`);
    console.log(error);
    console.log('********************************************');
    alert_toast(message);
};
function get_stream(streamAction) {
    return function (event) {
        try {
            streamAction(event.target.responseText);
        } catch (error) {
            print_error(`Error with stream request`, response.message || error);
            reject(error);
            
        };
    };
};
function get(options) {
    return new Promise((resolve, reject) => {
        show_spinner(options.spinner || options.table || '');
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("error", function () {reject()});

        if (options.streamAction) {
            XHR.addEventListener("load", get_stream(options.streamAction));

        } else {
            XHR.addEventListener("load", function (event) {
                eventParse(event)
                .then(response => {
                    if (response.success) {
                        if (options.func) {
                            add_page_links(
                                response.result.count,
                                response.result.limit,
                                response.result.offset,
                                options.table,
                                options.func
                            );
                        };
                        resolve([response.result, options]);

                    } else {
                        print_error(`Error getting ${options.table}`, response.message || response);
                        reject(new Error(response.message));

                    };
                })
                .catch(err => reject(err));
            });

        };
        
        send_XHR(
            XHR,
            'GET',
            `/${options.action || 'get'}/${options.location || options.table}`,
            {params: build_query(options).join('&')}
        );
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
            
        } else {
            console.log(`${form_id} not found`);

        };
    } catch (error) {
        console.log(`Error on form: ${form_id}: `, error);

    };
};
function sendData(form, method, _location, options = {reload: false}) {
    const XHR = new XMLHttpRequest();
    const FD  = new FormData(form);
    XHR.addEventListener("loadend", function () {hide_spinner(options.spinner || options.table || '')});
    XHR.addEventListener("load",    function (event) {
        eventParse(event)
        .then(response => {
            if (response.success) {
                if (!options.noConfirmAlert) alert_toast(response.message);
                
                if ( options.onComplete) {
                    if (Array.isArray(options.onComplete)) {
                        options.onComplete.forEach(func => {
                            if (typeof func === 'function') func(response);
                        });

                    } else {
                        if (typeof options.onComplete === 'function') options.onComplete(response);

                    };
                };
                if (options.reload) {
                    window.location.reload();

                } else if (options.redirect) {
                    window.location.assign(options.redirect);

                };
            } else {
                console.log(response);
                alert_toast(response.message || 'Ooooopsie');

            };
        })
        .catch(err => print_error('Error parsing response', err));
    });
    
    send_XHR(XHR, method, _location, {data: FD});
};
function send_XHR(XHR, method, path, options = {}) {
    XHR.addEventListener("error", function (event) {
        print_error('Error with request', event);
        alert_toast('Error with request');
    });
    XHR.open(method, `${path}?${options.params || ''}`);
    XHR.send(options.data || null);
};