let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Closed'};
function getLines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        let where = {demand_id: path[2]},
            statuses = getSelectedOptions('sel_lines_statuses');
        if (statuses.length > 0) where.status = statuses;
        get({
            table: 'demand_lines',
            where: where,
            func: getLines
        })
        .then(function ([result, options]) {
            let row_index = 0;
            set_count('line', result.count);
            result.lines.forEach(line => {
                try {
                    let row = tbl_lines.insertRow(-1);
                    let qty = 0;
                    line.orders.forEach(o => {
                        if (o.status > 0) {
                            qty += o.qty;
                        };
                    });
                    add_cell(row, {text: line.size.item.description});
                    add_cell(row, {
                        text: print_size(line.size),
                        append: [new Hidden_Input({
                            attributes:[
                                {field: 'name',  value: `lines[][${row_index}][demand_line_id]`},
                                {field: 'value', value: line.demand_line_id},
                            ]
                        }).e]
                    });
                    add_cell(row, {text: qty});
                    add_cell(row, {text: line_statuses[line.status] || 'Unknown'});
                    let radios = [], args = [line.demand_line_id, row_index, receive_options];
                    if (line.status === 0 || line.status === 1 || line.status === 2) {
                        if (typeof nil_radio     === 'function') radios.push(nil_radio(    ...args));
                    };
                    if (line.status === 1 || line.status === 2) {
                        if (typeof cancel_radio  === 'function') radios.push(cancel_radio( ...args));
                    };
                    if (line.status === 2) {
                        if (typeof receive_radio === 'function') radios.push(receive_radio(...args));
                    };
                    radios.push(new Div({attributes: [{field: 'id', value: `${line.demand_line_id}_details`}]}).e);
                    add_cell(row, {append: radios});
                    add_cell(row, {append: 
                        new Modal_Button(
                            _search(),
                            'line_view',
                            [{field: 'id', value: line.demand_line_id}]
                        ).e
                    });
                } catch (error) {
                    console.log(`Error loading line ${line.demand_line_id}:`)
                    console.log(error);
                };
                row_index++
            });
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
window.addEventListener('load', function () {
    addListener('reload', getLines);
    addListener('sel_status', getLines, 'change');
    modalOnShow('line_view', function (event) {showLine(event.relatedTarget.dataset.id)});
    addFormListener(
        'lines',
        'PUT',
        '/demand_lines',
        {
            onComplete: getLines
        }
    );
    add_sort_listeners('demand_lines', getLines);
    getLines();
});