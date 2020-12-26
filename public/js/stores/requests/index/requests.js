let request_statuses = {"0": "Cancelled", "1": "Draft", "2": "Open", "3": "Closed"}
function getRequests() {
    let sel_status = document.querySelector('#sel_status') || {value: ''};
    get(
        function (requests, options) {
            let table_body = document.querySelector('#tbl_requests');
            if (table_body) {
                table_body.innerHTML = '';
                requests.forEach(request => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: print_user(request.user_for)});
                    add_cell(row, {
                        sort: print_date(request.createdAt),
                        text: new Date(request.createdAt).toDateString()
                    });
                    add_cell(row, {text: request.lines.length});
                    add_cell(row, {text: request_statuses[request._status] || 'Unknown'});
                    add_cell(row, {append: new Link({href: `/stores/requests/${request.request_id}`, small: true}).e});
                });
            };
        },
        {
            table: 'requests',
            query: [sel_status.value]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getRequests);
document.querySelector('#sel_status').addEventListener('change', getRequests);