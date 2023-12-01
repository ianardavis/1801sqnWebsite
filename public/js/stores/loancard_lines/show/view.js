const statuses = {
    "0": "Cancelled", 
    "1": "Pending", 
    "2": "Complete", 
    "3": "Closed"
};
function getLoancardLine() {
    function display_details([line, options]) {
        setBreadcrumb(`${line.size.item.description} | ${line.size.item.size_text || 'Size'}: ${printSize(line.size)}`);
        setInnerText('bcr_loancard',   `${printUser(line.loancard.user_loancard)} | ${printDate(line.loancard.createdAt)}`);
        setInnerText('line_item',      line.size.item.description);
        setInnerText('line_size',      printSize(line.size));
        setInnerText('line_serial',    (line.serial ? line.serial.serial : ''));
        setInnerText('line_nsn',       (line.nsn ? printNSN(line.nsn) : ''));
        setInnerText('line_user',      printUser(line.user));
        setInnerText('line_createdAt', printDate(line.createdAt, true));
        setInnerText('line_updatedAt', printDate(line.updatedAt, true));
        return line;
    };
    function set_links(line) {
        setHREF('bcr_loancard',     `/loancards/${line.loancard_id}`);
        setHREF('line_user_link',   `/users/${line.user_id}`);
        setHREF('line_item_link',   `/items/${line.size.item_id}`);
        setHREF('line_size_link',   `/sizes/${line.size_id}`);
        setHREF('line_serial_link', (line.serial ? `/serials/${line.serial_id}`: null));
        return line;
    }
    function show_issues(line) {
        clear('tbl_issues')
        .then(tbl_issues => {
            let qty = 0;
            line.issues.forEach(issue => {
                qty += issue.qty
                let row = tbl_issues.insertRow(-1);
                addCell(row, {text: issue.issue_id});
                addCell(row, {append: new Link(`/issues/${issue.issue_id}`).e});
            });
            setInnerText('line_qty', qty);
        });
        return line;
    };
    function set_status_badges(line) {
        clearStatuses(3, statuses);
        if ([0, 1, 2, 3].includes(line.status)) {
            if (line.status === 0) {
                setBadge(1, 'danger', 'Cancelled');

            } else {
                setBadge(1, 'success');
                if (line.status > 1) {
                    setBadge(2, 'success');
                };
                if (line.status > 2) {
                    setBadge(3, 'success');
                };
            };
        };
        return line;
    };

    get({
        table: 'loancard_line',
        where: {line_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(show_issues)
    .then(set_status_badges)
};
window.addEventListener('load', function () {
    addListener('reload', getLoancardLine);
});