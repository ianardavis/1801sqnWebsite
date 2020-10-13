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
        if (request._status === 0) {
            add_cell(row, {text: 'Cancelled'})
        } else if (request._status === 1) {
            add_cell(row, {text: 'Draft'})
        } else if (request._status === 2) {
            add_cell(row, {text: 'Open'})
        } else if (request._status === 3) {
            add_cell(row, {text: 'Complete'})
        };
        add_cell(row, {append: new Link({href: '/stores/requests/' + request.request_id, small: true}).link});
    });
};