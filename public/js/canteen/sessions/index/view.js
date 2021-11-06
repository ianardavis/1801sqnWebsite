function getSessions() {
    clear('tbl_sessions')
    .then(tbl_sessions => {
        let sort_cols = tbl_sessions.parentNode.querySelector('.sort') || null;
        get({
            table: 'sessions',
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([sessions, options]) {
            let current_sessions = [];
            sessions.forEach(session => {
                let row = tbl_sessions.insertRow(-1);
                add_cell(row, table_date(session.createdAt, true));
                add_cell(row, (session.datetime_end ? table_date(session.datetime_end, true) : ''));
                add_cell(row, {text: 
                    (session.status === 0 ? 'Cancelled' : 
                    (session.status === 1 ? 'Open'      : 
                    (session.status === 2 ? 'Closed'    : 'Unknown')))
                });
                if (session.status === 1) current_sessions.push(session.session_id);
                add_cell(row, {append: new Link({
                    href: `/sessions/${session.session_id}`,
                    small: true
                }).e});
            });
        });
    });
};
addReloadListener(getSessions);