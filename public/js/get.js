get = (onComplete, options = {query: []}) => new Promise(resolve => {
    show_spinner(options.table);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText);
        if (response.result) onComplete(response[options.table], options);
        else alert('Error: ' + response.error);
        hide_spinner(options.table);
        resolve(true);
    });
    XHR_send(XHR, options.table, `/stores/get/${options.table}?${options.query.join('&')}`);
});

// get = (onComplete, options = {query: []}) => {
//     show_spinner(options.table);
//     const XHR = new XMLHttpRequest();
//     XHR.addEventListener("load", event => {
//         let response   = JSON.parse(event.target.responseText);
//         if (response.result) onComplete(response[options.table], options);
//         else alert('Error: ' + response.error);
//         hide_spinner(options.table);
//     });
//     XHR_send(XHR, options.table, `/stores/get/${options.table}?${options.query.join('&')}`);
// };