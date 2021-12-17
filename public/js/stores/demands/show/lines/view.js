let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Closed'};
function getLines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        let sel_status = document.querySelector('#sel_status') || {value: ''},
            where = {demand_id: path[2]};
        if (sel_status.value !== '') where.status = sel_status.value;
        get({
            table: 'demand_lines',
            where: where
        })
        .then(function ([lines, options]) {
            let row_index = 0;
            set_count('line', lines.length);
            lines.forEach(line => {
                try {
                    let row = tbl_lines.insertRow(-1);
                    add_cell(row, {text: line.size.item.description});
                    add_cell(row, {text: print_size(line.size)});
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
                            data: [{field: 'id', value: line.demand_line_id}]
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
        where: {demand_line_id: demand_line_id}
    })
    .then(function ([line, options]) {
        set_innerText('demand_line_id', line.demand_line_id);
        set_innerText('line_item',      line.size.item.description);
        set_innerText('line_size',      print_size(line.size));
        set_innerText('line_qty',       line.qty);
        set_innerText('line_user',      print_user(line.user));
        set_innerText('line_createdAt', print_date(line.createdAt, true));
        set_innerText('line_updatedAt', print_date(line.updatedAt, true));
        set_href('btn_line_link',  `/demand_lines/${line.demand_line_id}`);
        set_href('line_item_link', `/items/${line.size.item_id}`);
        set_href('line_size_link', `/sizes/${line.size_id}`);
        set_href('line_user_link', `/users/${line.user_id}`);
    });
};
addReloadListener(getLines);
window.addEventListener('load', function () {
    addListener('sel_status', getLines, 'change');
    modalOnShow('line_view', function (event) {showLine(event.relatedTarget.dataset.id)});
});