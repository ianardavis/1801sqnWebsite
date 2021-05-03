let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Closed'},
    row_index = 0;
function getLines() {
    clear_table('lines')
    .then(tbl_lines => {
        let sel_status = document.querySelector('#sel_status') || {value: ''};
        get({
            table: 'demand_lines',
            query: [`demand_id=${path[2]}`, sel_status.value]
        })
        .then(function ([lines, options]) {
            set_count({id: 'line', count: lines.length || '0'});
            lines.forEach(line => {
                try {
                    let row = tbl_lines.insertRow(-1);
                    add_cell(row, {text: line.size.item.description});
                    add_cell(row, {text: line.size.size});
                    add_cell(row, {text: line.qty});
                    add_cell(row, {
                        text: line_statuses[line.status] || 'Unknown',
                        ...(
                            [1, 2].includes(line.status) || [1, 2].includes(line.demand.status) ?
                            {
                                classes: ['actions'],
                                data:    [
                                    {field: 'id',    value: line.demand_line_id},
                                    {field: 'index', value: row_index}
                                ]
                            } : {}
                        )
                    });
                    add_cell(row, {append: 
                        new Button({
                            small: true,
                            modal: 'line_view',
                            data: {field: 'id', value: line.demand_line_id}
                        }).e
                    });
                } catch (error) {
                    console.log(`Error loading line ${line.line_id}:`)
                    console.log(error);
                };
                row_index ++
            });
        })
        .then(result => {
            if (typeof getLineActions === 'function') getLineActions();
        });
    });
};
function showLine(demand_line_id) {
    get({
        table: 'demand_line',
        query: [`demand_line_id=${demand_line_id}`]
    })
    .then(function ([line, options]) {
        set_innerText({id: 'demand_line_id', text: line.demand_line_id});
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
addReloadListener(getLines);
window.addEventListener('load', function () {
    addListener('sel_status', getLines, 'change');
    $('#mdl_line_view').on('show.bs.modal', function (event) {showLine(event.relatedTarget.dataset.id)});
});