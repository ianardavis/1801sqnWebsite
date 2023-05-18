let line_statuses = {"0": "Cancelled", "1": "Pending", "2": "Complete", "3": "Closed"};
function getLoancardLine() {
    function set_status_badges(status) {
        clear_statuses(3, statuses);
        if ([0, 1, 2, 3].includes(status)) {
            if (status === 0) {
                set_badge(1, 'danger', 'Cancelled');

            } else {
                set_badge(1, 'success');
                if (status > 1) {
                    set_badge(2, 'success');
                };
                if (status > 2) {
                    set_badge(3, 'success');
                };
            };
        };
    };
    get({
        table: 'loancard_line',
        where: {loancard_line_id: path[2]}
    })
    .then(function ([line, options]) {
        set_breadcrumb(`${line.size.item.description} | ${line.size.item.size_text || 'Size'}: ${print_size(line.size)}`);

        set_innerText('bcr_loancard',   `${print_user(line.loancard.user_loancard)} | ${print_date(line.loancard.createdAt)}`);
        set_innerText('line_item',      line.size.item.description);
        set_innerText('line_size',      print_size(line.size));
        set_innerText('line_serial',    (line.serial ? line.serial.serial : ''));
        set_innerText('line_nsn',       (line.nsn ? print_nsn(line.nsn) : ''));
        set_innerText('line_user',      print_user(line.user));
        set_innerText('line_createdAt', print_date(line.createdAt, true));
        set_innerText('line_updatedAt', print_date(line.updatedAt, true));
        
        clear('tbl_issues')
        .then(tbl_issues => {
            let qty = 0;
            line.issues.forEach(issue => {
                qty += issue.qty
                let row = tbl_issues.insertRow(-1);
                add_cell(row, {text: issue.issue_id});
                add_cell(row, {append: new Link(`/issues/${issue.issue_id}`).e});
            });
            set_innerText('line_qty', qty);
        });
        
        set_href('bcr_loancard',     `/loancards/${line.loancard_id}`);
        set_href('line_user_link',   `/users/${line.user_id}`);
        set_href('line_item_link',   `/items/${line.size.item_id}`);
        set_href('line_size_link',   `/sizes/${line.size_id}`);
        set_href('line_serial_link', (line.serial ? `/serials/${line.serial_id}`: null));

        set_status_badges(line.status);
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getLoancardLine);
});