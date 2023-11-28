let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    clear('tbl_issues')
    .then(tbl_issues => {
        function add_line(line, index) {
            let row = tbl_issues.insertRow(-1);
            addCell(row, {text: printUser(line.loancard.user_loancard)});
            addCell(row, {text: (line.size ? (line.size.item ? line.size.item.description : '') : '')});
            addCell(row, {text: (line.size ? printSize(line.size) : '')});
            addCell(row, {text: line.qty});
            addCell(row, tableDate(line.createdAt));
            addCell(row, tableDate(line.loancard.date_due));
            addCell(row, {text: 'Issued'});
            addCell(row, {
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
            addCell(row, {append: new Link(`/loancards/${line.loancard_id}`).e});
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
    addListener('reload', getLines);
});