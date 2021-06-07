let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    clear_table('issues')
    .then(tbl_issues => {
        get({table: 'loancard_lines_due'})
        .then(function ([lines, options]) {
            let row_index = 0;
            lines.forEach(line => {
                let row = tbl_issues.insertRow(-1);
                add_cell(row, {text: print_user(line.loancard.user_loancard)});
                add_cell(row, {text: (line.size ? (line.size.item ? line.size.item.description : '') : '')});
                add_cell(row, {text: (line.size ? line.size.size : '')});
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
        })
        .then(result => {
            if (typeof addEditSelect === 'function') addEditSelect();
        });
    })
};