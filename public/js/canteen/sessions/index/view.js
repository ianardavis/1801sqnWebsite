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
                addCell(row, tableDate(session.createdAt, true));
                addCell(row, (session.datetime_end ? tableDate(session.datetime_end, true) : ''));
                addCell(row, {text: 
                    (session.status === 0 ? 'Cancelled' : 
                    (session.status === 1 ? 'Open'      : 
                    (session.status === 2 ? 'Closed'    : 'Unknown')))
                });
                if (session.status === 1) current_sessions.push(session.session_id);
                addCell(row, {append: new Link(`/sessions/${session.session_id}`).e});
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSessions);
    addSortListeners('sessions', getSessions);
    getSessions();
});