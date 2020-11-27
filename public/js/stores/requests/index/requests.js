showRequests = (requests, options = {}) => {
    clearElement('tbl_requests');
    let table_body = document.querySelector('#tbl_requests');
    requests.forEach(request => {
        let row = table_body.insertRow(-1);
        add_cell(row, {text: `${request.user_for.rank._rank} ${request.user_for.full_name}`});
        add_cell(row, {
            sort: new Date(request.createdAt).getTime(),
            text: new Date(request.createdAt).toDateString()
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
        add_cell(row, {append: new Link({href: '/stores/requests/' + request.request_id, small: true}).e});
    });
};