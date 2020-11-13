get = (onComplete, options = {query: []}) => new Promise(resolve => {
    if (options.table && typeof(options.table) === 'string' && options.table !== '') {
        show_spinner(options.table);
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", event => {
            let response = JSON.parse(event.target.responseText);
            if (response.result) onComplete(response[options.table], options);
            else {
                alert(`Error: ${response.message || response.error || 'unknown'}`);
                onComplete(response[options.table], options)
            };
            hide_spinner(options.table);
            resolve(true);
        });
        XHR_send(XHR, options.table, `/${options.db || 'stores'}/get/${options.table}?${options.query.join('&')}`);
    } else console.log('public/js/get.js:13', 'No/Invalid table specified');
});