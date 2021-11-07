let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    disable_button('action');
    clear('tbl_issues')
    .then(tbl_issues => {
        let sort_cols = tbl_issues.parentNode.querySelector('.sort') || null;
        get({
            table: 'loancard_lines_due',
            ...sort_query(sort_cols)
        })
        .then(function ([lines, options]) {
            let row_index = 0;
            lines.forEach(line => {
                let row = tbl_issues.insertRow(-1);
                add_cell(row, {text: print_user(line.loancard.user_loancard)});
                add_cell(row, {text: (line.size ? (line.size.item ? line.size.item.description : '') : '')});
                add_cell(row, {text: (line.size ? print_size(line.size) : '')});
                add_cell(row, {text: line.qty})
                add_cell(row, table_date(line.createdAt));
                add_cell(row, table_date(line.loancard.date_due));
                add_cell(row, {
                    text: 'Issued',
                    ...(
                        (line.status === 1 && line.loancard.status === 1) ||
                        (line.status === 2 && line.loancard.status === 2)
                        ? {
                            classes: ['actions'],
                            data: [
                                {field: 'id',    value: line.loancard_line_id},
                                {field: 'index', value: row_index}
                            ]
                        }
                        : {}
                    )
                });
                add_cell(row, {append: new Link({
                    small: true,
                    href: `/loancards/${line.loancard_id}`
                }).e});
                row_index++
            });
            return true;
        })
        .then(result => {
            if (typeof addEditSelect === 'function') addEditSelect();
            enable_button('action');
        });
    })
};
addReloadListener(getLines);