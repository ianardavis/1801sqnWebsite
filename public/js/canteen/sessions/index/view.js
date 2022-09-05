function getSessions() {
    clear('tbl_sessions')
    .then(tbl_sessions => {
        get({
            table: 'sessions',
            func: getSessions
        })
        .then(function ([results, options]) {
            let current_sessions = [];
            results.sessions.forEach(session => {
                let row = tbl_sessions.insertRow(-1);
                add_cell(row, table_date(session.createdAt, true));
                add_cell(row, (session.datetime_end ? table_date(session.datetime_end, true) : ''));
                add_cell(row, {text: 
                    (session.status === 0 ? 'Cancelled' : 
                    (session.status === 1 ? 'Open'      : 
                    (session.status === 2 ? 'Closed'    : 'Unknown')))
                });
                if (session.status === 1) current_sessions.push(session.session_id);
                add_cell(row, {append: new Link(`/sessions/${session.session_id}`).e});
            });
        });
    });
};
addReloadListener(getSessions);
window.addEventListener('load', function () {
    add_sort_listeners('sessions', getSessions);
    getSessions();
});