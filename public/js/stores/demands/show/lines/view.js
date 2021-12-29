let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Closed'};
function getLines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        let sel_status = document.querySelector('#sel_status') || {value: ''},
            where = {demand_id: path[2]};
        if (sel_status.value !== '') where.status = sel_status.value;
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
                    add_cell(row, {text: line.size.item.description});
                    add_cell(row, {
                        text: print_size(line.size),
                        append: [new Hidden({
                            attributes:[
                                {field: 'name',  value: `lines[][${row_index}][demand_line_id]`},
                                {field: 'value', value: line.demand_line_id},
                            ]
                        }).e]
                    });
                    add_cell(row, {text: line.qty});
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
function receive_options() {
    clear(`${this.dataset.id}_details`)
    .then(div_details => {
        if (this.value === '3') {
            div_details.appendChild(new Spinner(this.dataset.id).e);
            get({
                table: 'demand_line',
                where: {demand_line_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                if ([1,2].includes(line.status)) {
                    if (line.size.has_serials) {
                        for (let i = 0; i < line.qty; i++) {
                            div_details.appendChild(new Select({
                                attributes: [
                                    {field: 'name',        value: `lines[][${options.index}][serials][][${i}][serial]`},
                                    {field: 'required',    value: true},
                                    {field: 'placeholder', value: `Serial ${i + 1}`}
                                ]
                            }).e);
                            div_details.appendChild(new Select({
                                attributes: [
                                    {field: 'name',        value: `lines[][${options.index}][serials][][${i}][location]`},
                                    {field: 'required',    value: true},
                                    {field: 'placeholder', value: `Location ${i + 1}`}
                                ]
                            }).e);
                        };
                    } else {
                        let list = document.createElement('datalist');
                        list.setAttribute('id', `loc_list_${options.index}`);
                        div_details.appendChild(new Input({
                            attributes: [
                                {field: 'name',        value: `lines[][${options.index}][location]`},
                                {field: 'required',    value: true},
                                {field: 'list',        value: `loc_list_${options.index}`},
                                {field: 'placeholder', value: 'Enter Location...'}
                            ]
                        }).e);
                        div_details.appendChild(list);
                        get({
                            table: 'stocks',
                            where: {size_id: line.size_id}
                        })
                        .then(function ([result, options]) {
                            result.stocks.forEach(e => list.appendChild(new Option({value: e.location.location}).e));
                        });
                        div_details.appendChild(new Input({
                            attributes: [
                                {field: 'type',        value: 'number'},
                                {field: 'min',         value: '1'},
                                {field: 'Placeholder', value: 'Receipt Quantity'},
                                {field: 'name',        value: `lines[][${options.index}][qty]`},
                                {field: 'required',    value: true},
                                {field: 'value',       value: line.qty}
                            ]
                        }).e);
                    };
                };
                remove_spinner(line.demand_line_id);
            });
        };
    });
};
addReloadListener(getLines);
sort_listeners(
    'demand_lines',
    getLines,
    [
        {value: '["createdAt"]',                 text: 'Date', selected: true},
        {value: '["size","item","description"]', text: 'Description'},
        {value: '["size","size1"]',              text: 'Size1'},
        {value: '["size","size2"]',              text: 'Size2'},
        {value: '["size","size3"]',              text: 'Size3'},
        {value: '["status"]',                    text: 'Status'}
    ]
);
window.addEventListener('load', function () {
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
});