function getByUser(onComplete, options = {query: []}) {
    return new Promise(resolve => {
        try {
            show_spinner(options.table);
            const XHR = new XMLHttpRequest();
            XHR.addEventListener("load", function () {
                let response = JSON.parse(event.target.responseText);
                if (response.success) onComplete(response.result || response[options.table], options);
                else alert(`Error: ${response.error}`);
                hide_spinner(options.table);
                resolve(true);
            });
            XHR.addEventListener("error", function () {
                alert(`Something went wrong getting ${options.table}`)
                hide_spinner(options.spinner || options.table);
            });
            XHR.open(options.method || 'GET', `/stores/get/${options.table}/${options.user_id}?${options.query.join('&')}`);
            XHR.send();
        } catch (error) {
            console.log(`Error getting from ${options.table}`)
        };
    });
};