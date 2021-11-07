var statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Closed'};
function getSession() {
    get({
        table: 'session',
        query: [`"session_id":"${path[2]}"`]
    })
    .then(function ([session, options]) {
        set_breadcrumb({text: print_date(session.createdAt, true)});
        set_innerText({id: 'session_status',       value: statuses[session.status] || 'Unknown'});
        set_innerText({id: 'session_createdAt',    value: print_date(session.createdAt, true)});
        set_innerText({id: 'session_user_open',    value: print_user(session.user_open)});
        set_innerText({id: 'session_datetime_end', value: print_date(session.datetime_end, true)});
        set_innerText({id: 'session_user_close',   value: print_user(session.user_close)});
        if (typeof enable_close_button === 'function') enable_close_button(session.status); 
    });
};
addReloadListener(getSession);