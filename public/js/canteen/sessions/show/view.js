var statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Closed'};
function getSession() {
    get({
        table: 'session',
        query: [`session_id=${path[2]}`]
    })
    .then(function ([session, options]) {
        set_breadcrumb({text: session.session_id});
        set_innerText({id: 'session_status',       value: statuses[session.status] || 'Unknown'});
        set_innerText({id: 'session_createdAt',    value: print_date(session.createdAt)});
        set_innerText({id: 'session_user_open',    value: print_user(session.user_open)});
        set_innerText({id: 'session_datetime_end', value: print_date(session.datetime_end)});
        set_innerText({id: 'session_user_close',   value: print_user(session.user_close)});
    });
};
addReloadListener(getSession);