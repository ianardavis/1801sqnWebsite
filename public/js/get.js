function build_query(options) {
    let queries = [];
    if (!options.action || (options.action !== 'sum' && options.action !== 'count')) {
        if (!options.order) {
            let order_col = document.querySelector(`#sort_${options.table}`),
                order_dir = document.querySelector(`#sort_${options.table}_dir`);
            console.log(order_col.value);
            console.log(order_dir.value);
            if (order_col && order_dir) {
                let order_col_parsed = JSON.parse(order_col.value);
                options.order = order_col_parsed.concat([order_dir.value]);
            };
        };
        if (options.order) queries.push(`order=${ JSON.stringify(options.order)}`);
        let limit  = document.querySelector(`.limit_${ options.table} .active`),
            offset = document.querySelector(`.offset_${options.table} .active`);
        if (limit && limit.dataset.value !== 'All') queries.push(`limit=${ JSON.stringify(limit .dataset.value)}`);
        if (offset)                                 queries.push(`offset=${JSON.stringify(offset.dataset.value)}`);
    };
    if (options.where) queries.push(`where=${JSON.stringify(options.where)}`);
    if (options.like ) queries.push(`like=${ JSON.stringify(options.like)}`);
    if (options.lt   ) queries.push(`lt=${   JSON.stringify(options.lt)}`);
    if (options.gt   ) queries.push(`gt=${   JSON.stringify(options.gt)}`);
    return queries;
};
function XHR_ErrorListener(XHR, spinner) {
    XHR.addEventListener("error", function (event) {
        hide_spinner(spinner);
        console.log(`************ Error with request ************`);
        console.log(event);
        console.log('********************************************');
    });
};
function eventParse(event) {
    try {
        if      (!event)                                        reject(new Error('No event'))
        else if (!event.target)                                 reject(new Error('No target'))
        else if (!event.target.responseText)                    reject(new Error('No response'))
        else if (typeof event.target.responseText !== 'string') reject(new Error('No valid response'))
        else return JSON.parse(event.target.responseText);
    } catch (err) {
        return {};
    };
};
function get(options) {
    return new Promise((resolve, reject) => {
        show_spinner(options.spinner || options.table || '');
        const XHR = new XMLHttpRequest();
        XHR_ErrorListener(XHR, options.spinner || options.table || '');
        XHR.addEventListener("load", function (event) {
            hide_spinner(options.spinner || options.table || '');
            try {
                if (options.streamAction) options.streamAction(event.target.responseText)
                else {
                    let response = eventParse(event);
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
        });
        XHR.addEventListener("error", function () {reject()});
        
        XHR.open('GET', `/${options.action || 'get'}/${options.location || options.table}?${build_query(options).join('&')}`);
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
        console.log(`Error on form: ${form_id}: `, error)
    };
};
function sendData(form, method, _location, options = {reload: false}) {
    const XHR = new XMLHttpRequest(),
          FD  = new FormData(form);
    XHR_ErrorListener(XHR, options.spinner || options.table || '');
    XHR.addEventListener("load", function (event) {
        try {
            let response = eventParse(event);
            if (response.success) {
                if (!options.noConfirmAlert) alert_toast(response.message);
                if ( options.onComplete) {
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
                console.log(response);
                alert_toast(response.message || response.error || 'Ooooopsie');
            };
        } catch (error) {
            console.log(error)
        };
    });
    XHR.addEventListener("error", function () {alert_toast('Ooooopsie Daisie')});
    XHR.open(method, _location);
    XHR.send(FD);
};