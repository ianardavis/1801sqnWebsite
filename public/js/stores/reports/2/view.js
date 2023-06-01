let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    clear('tbl_issues')
    .then(tbl_issues => {
        function add_line(line, index) {
            let row = tbl_issues.insertRow(-1);
            add_cell(row, {text: print_user(line.loancard.user_loancard)});
            add_cell(row, {text: (line.size ? (line.size.item ? line.size.item.description : '') : '')});
            add_cell(row, {text: (line.size ? print_size(line.size) : '')});
            add_cell(row, {text: line.qty});
            add_cell(row, table_date(line.createdAt));
            add_cell(row, table_date(line.loancard.date_due));
            add_cell(row, {text: 'Issued'});
            add_cell(row, {
                ...(
                    (line.status === 1 && line.loancard.status === 1) ||
                    (line.status === 2 && line.loancard.status === 2)
                    ? {
                        classes: ['actions'],
                        data: [
                            {field: 'id',    value: line.line_id},
                            {field: 'index', value: index}
                        ]
                    }
                    : {}
                )
            });
            add_cell(row, {append: new Link(`/loancards/${line.loancard_id}`).e});
        };
        get({
            table: 'loancard_lines_due'
        })
        .then(function ([result, options]) {
            let index = 0;
            result.lines.forEach(line => {
                add_line(line, index);
                index++
            });
            if (typeof addEditSelect === 'function') addEditSelect();
        });
    })
};
window.addEventListener('load', function () {
    add_listener('reload', getLines);
});