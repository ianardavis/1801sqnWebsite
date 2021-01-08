function get(onComplete, options = {query: []}) {
    return new Promise(resolve => {
        if (options.table && typeof(options.table) === 'string' && options.table !== '') {
            show_spinner(options.spinner || options.table);
            const XHR = new XMLHttpRequest();
            XHR.addEventListener("load", function (event) {
                try {
                    let response = JSON.parse(event.target.responseText);
                    // console.log(event.target.responseText);
                    // console.log(response);
                    // console.log(options);
                    if (response.success === true) onComplete(response.result || response[options.table] || response.lines, options);
                    else {
                        console.log(response)
                        alert(`Error: ${response.message || response.error || 'unknown'}`);
                        if (options.onFail) options.onFail();
                        onComplete(response[options.table] || response.lines, options)
                    };
                    hide_spinner(options.spinner || options.table);
                    resolve(true);
                } catch (error) {
                    console.log(`Error processing request:`, options, error);
                };
            });
            XHR.addEventListener("error", function () {
                alert(`Something went wrong getting ${options.table}`)
                hide_spinner(options.spinner || options.table || '');
            });
            XHR.open(options.method || 'GET', `/${options.db || 'stores'}/get/${options.table}?${options.query.join('&')}`);
            XHR.send();
        } else console.log('public/js/get.js:29', 'No/Invalid table specified');
    });
};