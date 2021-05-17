let lines_loaded = false,
    line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    lines_loaded = false;
    let sel_status = document.querySelector('#sel_status') || {value: ''};
    get({
        table: 'loancard_lines',
        query: [`loancard_id=${path[2]}`, sel_status.value]
    })
    .then(function ([lines, options]) {
        set_count({id: 'line', count: lines.length || '0'});
        let table_body = document.querySelector('#tbl_lines');
        if (table_body) {
            table_body.innerHTML = '';
            lines.forEach(line => {
                try {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: line.size.item.description});
                    add_cell(row, {text: line.size.size});
                    add_cell(row, {text: line.qty});
                    if (
                        (line.status === 1 && line.loancard.status === 1) ||
                        (line.status === 2 && line.loancard.status === 2)
                    ) {
                        add_cell(row, {
                            text: line_statuses[line.status],
                            classes: ['actions'],
                            data: [{
                                field: 'line_id',
                                value: line.line_id
                            }]
                        })
                    } else add_cell(row, {text: line_statuses[line.status]});
                    add_cell(row, {append: 
                        new Link({
                            small: true,
                            modal: 'line_view',
                            data: [{
                                field: `loancard_line_id`,
                                value: line.line_id
                            }]
                        }).e
                    });
                } catch (error) {
                    console.log(`Error loading line ${line.line_id}:`)
                    console.log(error);
                };
            });
        };
        lines_loaded = true;
    });
};
function showLine(event) {
    get({
        table: 'loancard_line',
        query: [`line_id=${event.relatedTarget.dataset.loancard_line_id}`]
    })
    .then(function ([line, options]) {
        set_innerText({id: 'line_id',        text: line.line_id});
        set_innerText({id: 'line_item',      text: line.size.item.description});
        set_innerText({id: 'line_size',      text: line.size.size});
        set_innerText({id: 'line_qty',       text: line.qty});
        set_innerText({id: 'line_user',      text: print_user(line.user)});
        set_innerText({id: 'line_createdAt', text: print_date(line.createdAt, true)});
        set_innerText({id: 'line_updatedAt', text: print_date(line.updatedAt, true)});
        set_href({id: 'line_item_link', value: `/items/${line.size.item_id}`});
        set_href({id: 'line_size_link', value: `/sizes/${line.size_id}`});
        set_href({id: 'line_user_link', value: `/users/${line.user_id}`});
    });
};
window.addEventListener('load', function () {
    document.querySelector('#reload')    .addEventListener('click',  getLines);
    document.querySelector('#sel_status').addEventListener('change', getLines);
    modalOnShow('line_view', showLine);
});