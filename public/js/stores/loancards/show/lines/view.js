let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    disable_button('action');
    clear('tbl_lines')
    .then(tbl_lines => {
        let sel_status = document.querySelector('#sel_status') || {value: ''},
            sort_cols  = tbl_items.parentNode.querySelector('.sort') || null,
            query      = [`"loancard_id":"${path[2]}"`];
        if (sel_status.value !== '') query.push(sel_status.value);
        get({
            table: 'loancard_lines',
            query: query,
            ...sort_query(sort_cols)
        })
        .then(function ([lines, options]) {
            set_count({id: 'line', count: lines.length || '0'});
            let row_index = 0;
            lines.forEach(line => {
                try {
                    let row = tbl_lines.insertRow(-1);
                    add_cell(row, {text: line.size.item.description});
                    add_cell(row, {text: print_size(line.size)});
                    add_cell(row, {text: line.qty});
                    add_cell(row, {
                        text: line_statuses[line.status],
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
                    })
                    add_cell(row, {append: 
                        new Button({
                            small: true,
                            modal: 'line_view',
                            data: [{
                                field: 'id',
                                value: line.loancard_line_id
                            }]
                        }).e
                    });
                } catch (error) {
                    console.log(`Error loading line ${line.loancard_line_id}:`)
                    console.log(error);
                };
                row_index++
            });
            return true;
        })
        .then(result => {
            if (typeof addEditSelect === 'function') addEditSelect();
        });
    });
};
function viewLine(loancard_line_id) {
    get({
        table: 'loancard_line',
        query: [`"loancard_line_id":"${loancard_line_id}"`]
    })
    .then(function ([line, options]) {
        set_innerText({id: 'loancard_line_id', text: line.loancard_line_id});
        set_innerText({id: 'line_item',        text: line.size.item.description});
        set_innerText({id: 'line_size',        text: print_size(line.size)});
        set_innerText({id: 'line_qty',         text: line.qty});
        set_innerText({id: 'line_user',        text: print_user(line.user)});
        set_innerText({id: 'line_createdAt',   text: print_date(line.createdAt, true)});
        set_innerText({id: 'line_updatedAt',   text: print_date(line.updatedAt, true)});
        set_href({id: 'btn_line_link', value: `/loancard_lines/${line.loancard_line_id}`});
        set_href({id: 'line_item_link',         value: `/items/${line.size.item_id}`});
        set_href({id: 'line_size_link',         value: `/sizes/${line.size_id}`});
        set_href({id: 'line_user_link',         value: `/users/${line.user_id}`});
    });
};
addReloadListener(getLines);
window.addEventListener('load', function () {
    addListener('sel_status', getLines, 'change');
    modalOnShow('line_view', function (event) {viewLine(event.relatedTarget.dataset.id)});
});