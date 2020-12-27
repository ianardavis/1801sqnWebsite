var request_statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Open', '3':'Closed'};
function getRequest() {
    get(
        function (request, options) {
            set_innerText({id: 'user_for',      text: print_user(request.user_for)});
            set_innerText({id: 'user_by',       text: print_user(request.user_by)});
            set_attribute({id: 'user_for_link', attribute: 'href', value: `/stores/users/${request.requested_for}`});
            set_attribute({id: 'user_for_by',   attribute: 'href', value: `/stores/users/${request.user_id}`});
            set_innerText({id: 'createdAt',     text: print_date(request.createdAt, true)});
            set_innerText({id: 'updatedAt',     text: print_date(request.updatedAt, true)});
            set_innerText({id: '_status',       text: request_statuses[request._status]});
            set_breadcrumb({text: request.request_id, href: `/stores/requests/${request.request_id}`});
        },
        {
            table: 'request',
            query: [`request_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getRequest);