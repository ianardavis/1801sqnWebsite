function getLoancards() {
    clear('tbl_loancards')
    .then(tbl_loancards => {
        function add_line(line) {
            let row = tbl_loancards.insertRow(-1);
            add_cell(row, table_date(line.createdAt));
            add_cell(row, {text: print_user(line.loancard.user_loancard)});
            add_cell(row, {text: line.status});
            add_cell(row, {append: new Modal_Button(
                _search(),
                'loancard_view',
                [{field: 'id', value: line.line_id}]
            ).e});
        };

        get({
            table: 'loancard_lines',
            where: {serial_id: path[2]},
            func: getLoancards
        })
        .then(function ([result, options]) {
            setCount('loancard', result.count);
            result.lines.forEach(line => {
                add_line(line);
            });
        })
    });
};
function viewLoancard(line_id) {
    function display_details([line, options]) {
        setInnerText('loancard_id',             line.loancard_id);
        setInnerText('line_id',                 line.line_id);
        setInnerText('loancard_user_to',        print_user(line.loancard.user_loancard));
        setInnerText('loancard_user_by',        print_user(line.loancard.user));
        setInnerText('loancard_status',         line.loancard.status);
        setInnerText('loancard_createdAt',      print_date(line.loancard.createdAt, true));
        setInnerText('loancard_updatedAt',      print_date(line.loancard.updatedAt, true));
        setInnerText('loancard_line_item',      (line.size   ? (line.size.item ? line.size.item.description : 'Unknown Item') : 'Unknown Size'));
        setInnerText('loancard_line_size',      (line.size   ? print_size(line.size) : 'Unknown Size'));
        setInnerText('loancard_line_nsn',       (line.nsn ? print_nsn(line.nsn) : ''));
        setInnerText('loancard_line_status',    line.status);
        setInnerText('loancard_line_createdAt', print_date(line.createdAt, true));
        setInnerText('loancard_line_updatedAt', print_date(line.updatedAt, true));
        setInnerText('loancard_line_user',      print_user(line.user));
        return line;
    };
    function set_links(line) {
        setHREF('btn_loancard_link',       `/loancards/${line.loancard_id})`);
        setHREF('loancard_line_item_link', (line.size                   ? (line.size.item ? `/items/${line.size.item_id}` : '') : null));
        setHREF('loancard_user_to_link',   (line.loancard.user_loancard ? `/users/${line.loancard.user_id_loancard}` : null));
        setHREF('loancard_user_by_link',   (line.loancard.user          ? `/users/${line.loancard.user_id}`          : null));
        setHREF('loancard_line_size_link', (line.size                   ? `/sizes/${line.size_id}`                   : null));
        setHREF('loancard_line_nsn_link',  (line.nsn                    ? `/nsns/${line.nsn_id}`                     : null));
        setHREF('loancard_line_user_link', (line.user                   ? `/users/${line.user_id})`                  : null));
        return line;
    };

    get({
        table: 'loancard_line',
        where: {line_id: line_id}
    })
    .then(display_details)
    .then(set_links);
};
window.addEventListener('load', function () {
    add_listener('reload', getLoancards);
    modalOnShow('loancard_view', function (event) {viewLoancard(event.relatedTarget.dataset.id)});
});