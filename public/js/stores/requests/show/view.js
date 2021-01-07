function getRequest() {
    let statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Open', '3': 'Closed'};
    get(
        function (request, options) {
            set_innerText({id: `user_request`,      text: print_user(request.user_request)});
            set_innerText({id: 'user',              text: print_user(request.user)});
            set_attribute({id: `user_request_link`, attribute: 'href', value: `/stores/users/${request.user_request}`});
            set_attribute({id: 'user_link',         attribute: 'href', value: `/stores/users/${request.user_id}`});
            set_innerText({id: 'createdAt',         text: print_date(request.createdAt, true)});
            set_innerText({id: 'updatedAt',         text: print_date(request.updatedAt, true)});
            set_innerText({id: '_status',           text: statuses[request._status]});
            set_breadcrumb({
                text: request.request_id,
                href: `/stores/requests/${request.request_id}`
            });
        },
        {
            table: 'request',
            query: [`request_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getRequest);