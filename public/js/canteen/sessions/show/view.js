var statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Closed'};
function getSession() {
    get({
        table: 'session',
        where: {session_id: path[2]}
    })
    .then(function ([session, options]) {
        setBreadcrumb(printDate(session.createdAt, true));
        setInnerText('session_status',       statuses[session.status] || 'Unknown');
        setInnerText('session_createdAt',    printDate(session.createdAt, true));
        setInnerText('session_user_open',    printUser(session.user_open));
        setInnerText('session_datetime_end', printDate(session.datetime_end, true));
        setInnerText('session_user_close',   printUser(session.user_close));
        if (typeof enable_close_button === 'function') enable_close_button(session.status); 
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSession);
});