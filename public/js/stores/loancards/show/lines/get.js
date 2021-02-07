let lines_loaded = false,
    line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    lines_loaded = false;
    let sel_status = document.querySelector('#sel_status') || {value: ''};
    get(
        {
            table: 'loancard_lines',
            query: [`loancard_id=${path[3]}`, sel_status.value]
        },
        function (lines, options) {
            set_count({id: 'line', count: lines.length || '0'});
            let table_body = document.querySelector('#tbl_lines');
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {text: line.size.item._description});
                        add_cell(row, {text: line.size._size});
                        add_cell(row, {text: line._qty});
                        if (
                            (line._status === 1 && line.loancard._status === 1) ||
                            (line._status === 2 && line.loancard._status === 2)
                        ) {
                            add_cell(row, {
                                text: line_statuses[line._status],
                                classes: ['actions'],
                                data: {
                                    field: 'line_id',
                                    value: line.line_id
                                }
                            })
                        } else add_cell(row, {text: line_statuses[line._status]});
                        add_cell(row, {append: 
                            new Link({
                                small: true,
                                modal: 'line_view',
                                data: {
                                    field: `loancard_line_id`,
                                    value: line.line_id
                                }
                            }).e
                        });
                    } catch (error) {
                        console.log(`Error loading line ${line.line_id}:`)
                        console.log(error);
                    };
                });
            };
            lines_loaded = true;
        }
    );
};
function showLine(event) {
    get(
        {
            table: 'loancard_line',
            query: [`line_id=${event.relatedTarget.dataset.loancard_line_id}`]
        },
        function (line, options) {
            set_innerText({id: 'line_id_view',        text: line.line_id});
            set_innerText({id: 'line_item_view',      text: line.size.item._description});
            set_attribute({id: 'line_item_view_link', attribute: 'href', value: `/stores/items/${line.size.item_id}`});
            set_innerText({id: 'line_size_view',      text: line.size._size});
            set_attribute({id: 'line_size_view_link', attribute: 'href', value: `/stores/sizes/${line.size_id}`});
            set_innerText({id: 'line_qty_view',       text: line._qty});
            set_innerText({id: 'line_user_view',      text: print_user(line.user)});
            set_attribute({id: 'line_user_view_link', attribute: 'href', value: `/stores/users/${line.user_id}`});
            set_innerText({id: 'line_createdAt_view', text: print_date(line.createdAt, true)});
            set_innerText({id: 'line_updatedAt_view', text: print_date(line.updatedAt, true)});
        }
    );
};
window.addEventListener('load', function () {
    document.querySelector('#reload')    .addEventListener('click',  getLines);
    document.querySelector('#sel_status').addEventListener('change', getLines);
    $('#mdl_line_view').on('show.bs.modal', showLine);
});