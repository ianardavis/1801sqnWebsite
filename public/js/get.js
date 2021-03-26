function get(options, onComplete) {
    return new Promise((resolve, reject) => {
        show_spinner(options.spinner || options.table || '');
        if (!options.query) options.query = [];
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", function (event) {
            try {
                let response = JSON.parse(event.target.responseText);
                if (response.success === true) onComplete(response.result, options);
                else {
                    alert(response.message || response.error || 'Unknown error');
                    if (options.onFail) options.onFail();
                };
                hide_spinner(options.spinner || options.table || '');
                resolve(true)
            } catch (error) {
                console.log(`Error processing request:`, options, error);
                reject(error);
            };
        });
        XHR.addEventListener("error", function (event) {
            alert(`Something went wrong getting ${options.table}`);
            hide_spinner(options.spinner || options.table || '');
            console.log(event);
            reject(new Error(`Something went wrong getting ${options.table}`));
        });
        XHR.open(options.method || 'GET', `/get/${options.table}?${options.query.join('&')}`);
        XHR.send();
    });
};
function count(options, onComplete) {
    return new Promise((resolve, reject) => {
        show_spinner(options.spinner || options.table || '');
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", function (event) {
            try {
                let response = JSON.parse(event.target.responseText);
                if (response.success === true) onComplete(response.result || 0, options);
                else {
                    alert(`Error: ${response.message || response.error || 'unknown'}`);
                    if (options.onFail) options.onFail();
                };
                hide_spinner(options.spinner || options.table || '');
                resolve(true)
            } catch (error) {
                console.log(`Error processing request:`, options, error);
                reject(error);
            };
        });
        XHR.addEventListener("error", function () {
            alert(`Something went wrong getting ${options.table}`);
            hide_spinner(options.spinner || options.table || '');
            reject(new Error(`Something went wrong getting ${options.table}`));
        });
        XHR.open('GET', `/count/${options.table}?${options.query.join('&')}`);
        XHR.send();
    });
};