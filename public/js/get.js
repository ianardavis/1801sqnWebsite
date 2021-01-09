function get(onComplete, options) {
    show_spinner(options.spinner || options.table || '');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function (event) {
        try {
            let response = JSON.parse(event.target.responseText);
            // console.log(event.target.responseText);
            // console.log(response);
            // console.log(options);
            if (response.success === true) {
                onComplete(response.result || response[options.table] || response.lines, options);
            } else {
                alert(`Error: ${response.message || response.error || 'unknown'}`);
                if (options.onFail) options.onFail();
            };
            hide_spinner(options.spinner || options.table || '');
        } catch (error) {
            console.log(`Error processing request:`, options, error);
        };
    });
    XHR.addEventListener("error", function () {
        alert(`Something went wrong getting ${options.table}`);
        hide_spinner(options.spinner || options.table || '');
    });
    XHR.open(options.method || 'GET', `/${options.db || 'stores'}/get/${options.table}?${options.query.join('&')}`);
    XHR.send();
};