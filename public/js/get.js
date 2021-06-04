function get(options) {
    return new Promise((resolve, reject) => {
        show_spinner(options.spinner || options.table || '');
        if (!options.query) options.query = [];
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
            console.log(`********* Error getting ${options.table} *********`);
            console.log(event);
            console.log('*******************************************');
            hide_spinner(options.spinner || options.table || '');
            reject(event);
        });
        XHR.open(options.method || 'GET', `/get/${options.table}?${options.query.join('&')}`);
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
            console.log(`********* Error counting ${options.table} *********`);
            console.log(event);
            console.log('*******************************************');
            hide_spinner(options.spinner || options.table || '');
            reject(event);
        });
        XHR.open('GET', `/count/${options.table}?${options.query.join('&')}`);
        XHR.send();
    });
};