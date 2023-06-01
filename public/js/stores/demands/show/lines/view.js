let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Received'};
function get_lines() {
    function line_query() {
        let where = {demand_id: path[2]};
        const statuses = getSelectedOptions('sel_lines_statuses');
        if (statuses.length > 0) where.status = statuses;
        return where;
    };
    clear('tbl_lines')
    .then(tbl_lines => {
        function add_line(line, index) {
            try {
                let row = tbl_lines.insertRow(-1);
                const qty = sum_order_qtys(line.orders);
                add_cell(row, {text: line.size.item.description});
                add_cell(row, {
                    text: print_size(line.size),
                    append: [new Hidden_Input({
                        attributes:[
                            {field: 'name',  value: `lines[][${index}][line_id]`},
                            {field: 'value', value: line.line_id},
                        ]
                    }).e]
                });
                add_cell(row, {text: qty});
                add_cell(row, {text: line_statuses[line.status] || 'Unknown'});
    
                let radios = [];
                const args = [line.line_id, index, receive_options];
    
                if ([0, 1, 2].includes(Number(line.status))) radios.push(nil_radio(    ...args));
                if ([   1, 2].includes(Number(line.status))) radios.push(cancel_radio( ...args));
                if (line.status === 2)                       radios.push(receive_radio(...args));
                radios.push(new Div({attributes: [{field: 'id', value: `details_${line.line_id}`}]}).e);
    
                add_cell(row, {append: radios});
    
                add_cell(row, {append: 
                    new Modal_Button(
                        _search(),
                        'line_view',
                        [{field: 'id', value: line.line_id}]
                    ).e
                });
    
            } catch (error) {
                console.error(`Error loading line ${index} (${line.line_id}):`)
                console.error(error);
                
            };
        };
        get({
            table: 'demand_lines',
            where: line_query(),
            func: get_lines
        })
        .then(function ([result, options]) {
            let index = 1;
            set_count('line', result.count);
            result.lines.forEach(line => {
                add_line(line, index);
                index++;
            });
        });
    });
};

function show_line(line_id) {
    function display_details([line, options]) {
        set_innerText('line_id',        line.line_id);
        set_innerText('line_item',      line.size.item.description);
        set_innerText('line_size',      print_size(line.size));
        set_innerText('line_qty',       sum_order_qtys(line.orders));
        set_innerText('line_user',      print_user(line.user));
        set_innerText('line_createdAt', print_date(line.createdAt, true));
        set_innerText('line_updatedAt', print_date(line.updatedAt, true));
        return line;
    };
    function set_links(line) {
        set_href('btn_line_link',  `/demand_lines/${line.line_id}`);
        set_href('line_item_link', `/items/${line.size.item_id}`);
        set_href('line_size_link', `/sizes/${line.size_id}`);
        set_href('line_user_link', `/users/${line.user_id}`);
        return line;
    };

    get({
        table: 'demand_line',
        where: {line_id: line_id}
    })
    .then(display_details)
    .then(set_links);
};

function sum_order_qtys(orders) {
    let qty = 0;
    orders.forEach(o => {
        if (o.status > 0) {
            qty += o.qty;
        };
    });
    return qty;
};

window.addEventListener('load', function () {
    modalOnShow('line_view', function (event) {show_line(event.relatedTarget.dataset.id)});

    add_listener('reload',             get_lines);
    add_listener('sel_lines_statuses', get_lines, 'input');
    
    addFormListener(
        'lines',
        'PUT',
        '/demand_lines',
        {
            onComplete: get_lines
        }
    );
    add_sort_listeners('demand_lines', get_lines);
    get_lines();
});