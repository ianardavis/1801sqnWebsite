function showLineActions(table, id) {
    get(
        function (actions, options) {
            set_count({id: 'line_actions', count: actions.length || '0'});
            let table_body = document.querySelector('#tbl_line_dates');
            if (table_body) {
                table_body.innerHTML = '';
                actions.forEach(e => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(e.createdAt, true));
                    add_cell(row, {text: e._action});
                    add_cell(row, {
                        text: print_user(e.user),
                        append: new Link({
                            small: true,
                            float: true,
                            href:  `/stores/users/${e.user_id}`
                        }).e
                    });
                    if (e.action_line_id) {
                        add_cell(row, {
                            append: new Link({
                                small: true,
                                href:  `/stores/${e._action.toLowerCase()}_lines/${e.action_line_id}`
                            }).e
                        });
                    } else add_cell(row);

                });
            };
        },
        {
            table: `${table}_line_actions`,
            query: [`${table}_line_id=${id}`]
        }
    );
};