function getLoancards() {
    clear('tbl_loancards')
    .then(tbl_loancards => {
        get({
            table: 'loancard_lines',
            where: {serial_id: path[2]},
            func: getLoancards
        })
        .then(function ([result, options]) {
            set_count('loancard', result.count);
            result.lines.forEach(line => {
                let row = tbl_loancards.insertRow(-1);
                add_cell(row, table_date(line.createdAt));
                add_cell(row, {text: print_user(line.loancard.user_loancard)});
                add_cell(row, {text: line.status});
                add_cell(row, {append: new Modal_Button(
                    _search(),
                    'loancard_view',
                    [{field: 'id', value: line.loancard_line_id}]
                ).e});
            });
        })
    });
};
function viewLoancard(loancard_line_id) {
    get({
        table: 'loancard_line',
        where: {loancard_line_id: loancard_line_id}
    })
    .then(function ([line, options]) {
        set_innerText('loancard_id',             line.loancard_id);
        set_innerText('loancard_line_id',        line.loancard_line_id);
        set_innerText('loancard_user_to',        print_user(line.loancard.user_loancard));
        set_innerText('loancard_user_by',        print_user(line.loancard.user));
        set_innerText('loancard_status',         line.loancard.status);
        set_innerText('loancard_createdAt',      print_date(line.loancard.createdAt, true));
        set_innerText('loancard_updatedAt',      print_date(line.loancard.updatedAt, true));
        set_innerText('loancard_line_item',      (line.size   ? (line.size.item ? line.size.item.description : 'Unknown Item') : 'Unknown Size'));
        set_innerText('loancard_line_size',      (line.size   ? print_size(line.size) : 'Unknown Size'));
        set_innerText('loancard_line_nsn',       (line.nsn ? print_nsn(line.nsn) : ''));
        set_innerText('loancard_line_status',    line.status);
        set_innerText('loancard_line_createdAt', print_date(line.createdAt, true));
        set_innerText('loancard_line_updatedAt', print_date(line.updatedAt, true));
        set_innerText('loancard_line_user',      print_user(line.user));
        set_href('btn_loancard_link',       `/loancards/${line.loancard_id})`);
        set_href('loancard_line_item_link', (line.size                   ? (line.size.item ? `/items/${line.size.item_id}` : '') : null));
        set_href('loancard_user_to_link',   (line.loancard.user_loancard ? `/users/${line.loancard.user_id_loancard}` : null));
        set_href('loancard_user_by_link',   (line.loancard.user          ? `/users/${line.loancard.user_id}`          : null));
        set_href('loancard_line_size_link', (line.size                   ? `/sizes/${line.size_id}`                   : null));
        set_href('loancard_line_nsn_link',  (line.nsn                    ? `/nsns/${line.nsn_id}`                     : null));
        set_href('loancard_line_user_link', (line.user                   ? `/users/${line.user_id})`                  : null));
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getLoancards);
    modalOnShow('loancard_view', function (event) {viewLoancard(event.relatedTarget.dataset.id)});
});