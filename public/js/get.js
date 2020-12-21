get = (onComplete, options = {query: []}) => new Promise(resolve => {
    if (options.table && typeof(options.table) === 'string' && options.table !== '') {
        show_spinner(options.spinner || options.table);
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", event => {
            try {
                let response = JSON.parse(event.target.responseText);
                // console.log(event.target.responseText);
                // console.log(response);
                // console.log(options);
                if (response.result === true) onComplete(response[options.table] || response.lines, options);
                else {
                    alert(`Error: ${response.message || response.error || 'unknown'}`);
                    onComplete(response[options.table] || response.lines, options)
                };
                hide_spinner(options.spinner || options.table);
                resolve(true);
            } catch (error) {
                console.log(`Error processing request:`, options, error);
            };
        });
        XHR_send({
            XHR:      XHR,
            table:    options.table,
            location: `/${options.db || 'stores'}/get/${options.table}?${options.query.join('&')}`,
            spinner:  options.spinner || ''
        });
    } else console.log('public/js/get.js:13', 'No/Invalid table specified');
});