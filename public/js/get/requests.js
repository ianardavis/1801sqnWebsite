getRequests = () => {
    show_spinner('requests');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#requestTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.requests.forEach(request => {
                let row = table_body.insertRow(-1);
                add_cell(row, {text: request._for.rank._rank + ' ' + request._for.full_name});
                add_cell(row, {
                    sort: new Date(request._date).getTime(),
                    text: new Date(request._date).toDateString()
                });
                add_cell(row, {text: request.lines.length});
                if (request._complete) add_cell(row, {html: _check()})
                else add_cell(row);
                if (request._closed)   add_cell(row, {html: _check()})
                else add_cell(row);
                add_cell(row, {append: link('/stores/requests/' + request.request_id, false)});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('requests');
    });
    let closedSelect   = document.querySelector('#closedSelect'),
        completeSelect = document.querySelector('#completeSelect'),
        query        = [];
    if      (Number(completeSelect.value) === 2) query.push('_complete=0')
    else if (Number(completeSelect.value) === 3) query.push('_complete=1');
    if      (Number(closedSelect.value) === 2)   query.push('_closed=0')
    else if (Number(closedSelect.value) === 3)   query.push('_closed=1');
    XHR_send(XHR, 'requests', '/stores/get/requests?' + query.join('&'));
};