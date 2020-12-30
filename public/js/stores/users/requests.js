var request_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3':'Approved', '4':'Declined'};
function getRequests () {
    let request_status = document.querySelector('#request_status');
    getByUser(
        function(lines, options) {
            set_count({id: 'request', count: lines.length || '0'})
            let table_body = document.querySelector('#tbl_requests');
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: new Date(line.createdAt).getTime(),
                        text: print_date(line.createdAt)
                    });
                    add_cell(row, {text: line.size.item._description});
                    add_cell(row, {text: line.size._size});
                    add_cell(row, {text: line._qty});
                    add_cell(row, {text: request_statuses[String(line._status)]});
                    add_cell(row, {
                        append: new Link({
                            href: `/stores/requests/${line.request_id}`,
                            small: true
                        }).e
                    });
                });
            };
        },
        {
            table: 'request_lines',
            user_id: path[3],
            query: [request_status.value]
        }
    );
};
function getDraftRequests() {
    get(
        function (requests, options) {
            let crd_draft_request = document.querySelector('#crd_draft_request');
            if (crd_draft_request) {
                if (requests.length > 0) {
                    crd_draft_request.classList.remove('hidden');
                    set_count({id: 'draft_request', count: requests.length || 0});
                    let draft_requests = document.querySelector('#draft_requests');
                    if (draft_requests) {
                        draft_requests.innerHTML = '';
                        requests.forEach(e => {
                            draft_requests.appendChild(
                                new P({append: new A({
                                    classes: ['f-10'],
                                    href: `/stores/requests/${e.request_id}`,
                                    text: `Request ${e.request_id}| Started: ${print_date(e.createdAt, true)}`
                                }).e}).e,
                                
                            );
                        });
                    };
                } else crd_draft_request.classList.add('hidden');
            };
        },
        {
            table: 'requests',
            query: [`user_id_request=${path[3]}`,'_status=1']
        }
    );
};
document.querySelector('#reload').addEventListener('click', getRequests);
document.querySelector('#reload').addEventListener('click', getDraftRequests);
document.querySelector('#request_status').addEventListener('change', getRequests);