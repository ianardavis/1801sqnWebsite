let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Received'};
function get_lines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        function add_line(line, index) {
            try {
                let row = tbl_lines.insertRow(-1);
                const qty = sum_order_qtys(line.orders);
                addCell(row, {text: line.size.item.description});
                addCell(row, {
                    text: printSize(line.size),
                    append: [new Hidden_Input({
                        attributes:[
                            {field: 'name',  value: `lines[][${index}][line_id]`},
                            {field: 'value', value: line.line_id},
                        ]
                    }).e]
                });
                addCell(row, {text: qty});
                addCell(row, {text: line_statuses[line.status] || 'Unknown'});
    
                let radios = [];
                const args = [line.line_id, index, receive_options];
    
                if ([0, 1, 2].includes(Number(line.status))) radios.push(nil_radio(    ...args));
                if ([   1, 2].includes(Number(line.status))) radios.push(cancel_radio( ...args));
                if (line.status === 2)                       radios.push(receive_radio(...args));
                radios.push(new Div({attributes: [{field: 'id', value: `details_${line.line_id}`}]}).e);
    
                addCell(row, {append: radios});
    
                addCell(row, {append: 
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
            where: {
                demand_id: path[2],
                ...filterStatus('demand_lines')
            },
            func: get_lines
        })
        .then(function ([result, options]) {
            let index = 1;
            setCount('line', result.count);
            result.lines.forEach(line => {
                add_line(line, index);
                index++;
            });
        });
    });
};

function show_line(line_id) {
    function display_details([line, options]) {
        setInnerText('line_id',        line.line_id);
        setInnerText('line_item',      line.size.item.description);
        setInnerText('line_size',      printSize(line.size));
        setInnerText('line_qty',       sum_order_qtys(line.orders));
        setInnerText('line_user',      printUser(line.user));
        setInnerText('line_createdAt', printDate(line.createdAt, true));
        setInnerText('line_updatedAt', printDate(line.updatedAt, true));
        return line;
    };
    function set_links(line) {
        setHREF('btn_line_link',  `/demand_lines/${line.line_id}`);
        setHREF('line_item_link', `/items/${line.size.item_id}`);
        setHREF('line_size_link', `/sizes/${line.size_id}`);
        setHREF('line_user_link', `/users/${line.user_id}`);
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
    orders.forEach(order => {
        if (order.status > 0) {
            qty += order.qty;
        };
    });
    return qty;
};

window.addEventListener('load', function () {
    modalOnShow('line_view', function (event) {show_line(event.relatedTarget.dataset.id)});

    addListener('reload',             get_lines);
    addListener('filter_demand_lines_status', get_lines, 'input');
    
    addFormListener(
        'lines',
        'PUT',
        '/demand_lines',
        {onComplete: get_lines}
    );
    addSortListeners('demand_lines', get_lines);
    get_lines();
});