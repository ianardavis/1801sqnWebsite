const line_statuses = {
    '0': 'Cancelled',
    '1': 'Pending',
    '2': 'Closed'
};
function getLines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        function add_line(line, index) {
            let row = tbl_lines.insertRow(-1);
            add_cell(row, {text: line.size.item.description});
            add_cell(row, {text: print_size(line.size)});
            add_cell(row, {text: print_nsn( line.nsn)});
            add_cell(row, {text: line.qty});
            add_cell(row, {
                text: line_statuses[line.status],
                append: new Hidden_Input({
                    attributes: [
                        {field: 'name',  value: `lines[][${index}][line_id]`},
                        {field: 'value', value: line.line_id}
                    ]
                }).e
            });
            add_action_radios(row, line, index);
            add_cell(row, {append: 
                new Modal_Button(
                    _search(),
                    'line_view',
                    [{
                        field: 'id',
                        value: line.line_id
                    }]
                ).e
            });
        };
        get({
            table: 'scrap_lines',
            where: {
                scrap_id: path[2],
                ...filter_status('scrap_line')
            },
            like: {
                ...filter_item('scrap_line'),
                ...filter_size('scrap_line')
            },
            func: getLines
        })
        .then(function ([result, options]) {
            setCount('line', result.count);
            let index = 0;
            result.lines.forEach(line => {
                add_line(line, index);
                index++
            });
        });
    });
};

function add_action_radios(row, line, row_index) {
    let radios = [];
    let args = [line.line_id, row_index];
    if (line.status === 1) {
        radios.push(   nil_radio(...args));
        radios.push(cancel_radio(...args, cancel_options));
    };
    radios.push(div_details(line.line_id, row_index));
    add_cell(row, {append: radios});
};

function cancel_options() {
    if (this.dataset.id) {
        clear(`details_${this.dataset.id}`)
        .then(div_details => {
            get({
                table: 'scrap_line',
                where: {line_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                div_details.appendChild(new Number_Input({
                    attributes: [
                        {field: 'min',      value: '1'},
                        {field: 'max',      value: line.qty},
                        {field: 'value',    value: line.qty},
                        {field: 'required', value: true},
                        {field: 'name',     value: `lines[][${options.index}][qty]`},
                        {field: 'placeholder', value: 'Quantity'}
                    ]
                }).e);
                add_location_input(div_details, options.index);
                add_location_list(div_details, (line.size.has_serials), line.size_id, options.index);
            });
        });
    };
};

function viewLine(line_id) {
    get({
        table: 'scrap_line',
        where: {line_id: line_id}
    })
    .then(function ([line, options]) {
        setInnerText('line_id',        line.line_id);
        setInnerText('line_item',      line.size.item.description);
        setInnerText('line_size',      print_size(line.size));
        setInnerText('line_qty',       line.qty);
        setInnerText('line_createdAt', print_date(line.createdAt, true));
        setInnerText('line_updatedAt', print_date(line.updatedAt, true));
        setHREF('btn_line_link',  `/scrap_lines/${line.line_id}`);
        setHREF('line_item_link', `/items/${line.size.item_id}`);
        setHREF('line_size_link', `/sizes/${line.size_id}`);
        setHREF('line_user_link', `/users/${line.user_id}`);
    });
};
window.addEventListener('load', function () {
    set_status_filter_options('scrap_line', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Pending', selected: true},
        {value: '2', text: 'Closed', selected: true}
    ]);
    addFormListener(
        'actions',
        'PUT',
        '/scrap_lines',
        {
            onComplete: [
                getLines,
                getScrap
            ]
        }
    );
    add_listener('reload', getLines);
    add_listener('filter_scrap_line_statuses', getLines, 'input');
    add_listener('filter_scrap_line_size_1',   getLines, 'input');
    add_listener('filter_scrap_line_size_2',   getLines, 'input');
    add_listener('filter_scrap_line_size_3',   getLines, 'input');
    add_listener('filter_scrap_line_item',     getLines, 'input');
    modalOnShow('line_view', function (event) {viewLine(event.relatedTarget.dataset.id)});
    add_sort_listeners('scrap_lines', getLines);
    getLines();
});