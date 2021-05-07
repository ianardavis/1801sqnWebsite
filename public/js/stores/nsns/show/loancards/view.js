function getLoancards() {
    clear_table('loancards')
    .then(tbl_loancards => {
        get({
            table: 'loancard_lines',
            query: [`nsn_id=${path[2]}`]
        })
        .then(function ([lines, options]) {
            set_count({id: 'loancard', count: lines.length || '0'});
            lines.forEach(line => {
                let row = tbl_loancards.insertRow(-1);
                add_cell(row, table_date(line.createdAt));
                add_cell(row, {text: print_user(line.loancard.user_loancard)});
                add_cell(row, {text: line.status});
                add_cell(row, {append: new Button({
                    modal: 'loancard_view',
                    data: {field: 'id', value: line.loancard_line_id},
                    small: true
                }).e});
            });
        })
    });
};
function viewLoancard(loancard_line_id) {
    get({
        table: 'loancard_line',
        query: [`loancard_line_id=${loancard_line_id}`]
    })
    .then(function ([line, options]) {
        set_innerText({id: 'loancard_id',             text: line.loancard_id});
        set_innerText({id: 'loancard_line_id',        text: line.loancard_line_id});
        set_innerText({id: 'loancard_user_to',        text: print_user(line.loancard.user_loancard)});
        set_innerText({id: 'loancard_user_by',        text: print_user(line.loancard.user)});
        set_innerText({id: 'loancard_status',         text: line.loancard.status});
        set_innerText({id: 'loancard_createdAt',      text: print_date(line.loancard.createdAt, true)});
        set_innerText({id: 'loancard_updatedAt',      text: print_date(line.loancard.updatedAt, true)});
        set_innerText({id: 'loancard_line_item',      text: (line.size   ? (line.size.item ? line.size.item.description : 'Unknown Item') : 'Unknown Size')});
        set_innerText({id: 'loancard_line_size',      text: (line.size   ? line.size.size     : 'Unknown Size')});
        set_innerText({id: 'loancard_line_serial',    text: (line.serial ? line.serial.serial : '')});
        set_innerText({id: 'loancard_line_qty',       text: line.qty});
        set_innerText({id: 'loancard_line_status',    text: line.status});
        set_innerText({id: 'loancard_line_createdAt', text: print_date(line.createdAt, true)});
        set_innerText({id: 'loancard_line_updatedAt', text: print_date(line.updatedAt, true)});
        set_innerText({id: 'loancard_line_user',      text: print_user(line.user)});
        set_href({id: 'btn_loancard_link',         value: `/loancards/${line.loancard_id})`});
        set_href({id: 'loancard_line_item_link',   value: (line.size                   ? (line.size.item ? `/items/${line.size.item_id}` : '') : '')});
        set_href({id: 'loancard_user_to_link',     value: (line.loancard.user_loancard ? `/users/${line.loancard.user_id_loancard}` : '')});
        set_href({id: 'loancard_user_by_link',     value: (line.loancard.user          ? `/users/${line.loancard.user_id}`          : '')});
        set_href({id: 'loancard_line_size_link',   value: (line.size                   ? `/sizes/${line.size_id}`                   : '')});
        set_href({id: 'loancard_line_serial_link', value: (line.serial                 ? `/serials/${line.serial_id}`               : '')});
        set_href({id: 'loancard_line_user_link',   value: (line.user                   ? `/users/${line.user_id})`                  : '')});
    });
};
addReloadListener(getLoancards);
window.addEventListener('load', function () {
    modalOnShow('loancard_view', function (event) {viewLoancard(event.relatedTarget.dataset.id)});
});