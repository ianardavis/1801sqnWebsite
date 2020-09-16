showRequests = (requests, options = {}) => {
    let table_body = document.querySelector('#requestTable');
    table_body.innerHTML = '';
    requests.forEach(request => {
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
        add_cell(row, {append: new Link({href: '/stores/requests/' + request.request_id, small: true}).link});
    });
};