function getSessions() {
    get(
        function (sessions, options) {
            clearElement('tbl_sessions');
            let table_body = document.querySelector('#tbl_sessions'),
                current_sessions = [];
            sessions.forEach(session => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    text: print_date(session.createdAt, true),
                    sort: new Date(session.createdAt).getTime()
                });
                if (session._end) {
                    add_cell(row, {
                        text: print_date(session._end, true),
                        sort: new Date(session._end).getTime()
                    });
                } else add_cell(row);
                if (session._status === 0) {
                    add_cell(row, {text: 'Cancelled'});
                } else if (session._status === 1) {
                    add_cell(row, {text: 'Open'});
                    current_sessions.push(session.session_id)
                } else if (session._status === 2) {
                    add_cell(row, {text: 'Closed'});
                } else add_cell(row, {text: 'Unknown'});
                add_cell(row, {append: new Link({
                    href: `/canteen/sessions/${session.session_id}`,
                    small: true
                }).e});
            });
            hide_spinner('sessions');
        },
        {
            db: 'canteen',
            table: 'sessions',
            query: []
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSessions);