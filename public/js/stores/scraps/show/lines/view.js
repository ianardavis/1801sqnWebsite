let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Closed'};
function getLines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        get({
            table: 'scrap_lines',
            ...build_filter_query('scrap_line', {scrap_id: path[2]}),
            func: getLines
        })
        .then(function ([result, options]) {
            set_count('line', result.count);
            let row_index = 0;
            result.lines.forEach(line => {
                try {
                    let row = tbl_lines.insertRow(-1);
                    add_cell(row, {text: line.size.item.description});
                    add_cell(row, {text: print_size(line.size)});
                    add_cell(row, {text: print_nsn(line.nsn)});
                    add_cell(row, {text: line.qty});
                    add_cell(row, {
                        text: line_statuses[line.status],
                        append: new Hidden_Input({
                            attributes: [
                                {field: 'name',  value: `lines[][${row_index}][line_id]`},
                                {field: 'value', value: line.line_id}
                            ]
                        }).e
                    });
                    let radios = [];
                    let args = [line.line_id, row_index];
                    if (line.status === 1) {
                        if (typeof nil_radio    === 'function') radios.push(nil_radio(   ...args));
                        if (typeof cancel_radio === 'function') radios.push(cancel_radio(...args));
                    };
                    radios.push(new Div({attributes: [{field: 'id', value: `${line.line_id}_details`}]}).e);
                    add_cell(row, {append: radios});
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
                } catch (error) {
                    console.log(`Error loading line ${line.line_id}:`)
                    console.log(error);
                };
                row_index++
            });
            return true;
        })
        .then(result => {
            if (typeof enable_radios === 'function') enable_radios(tbl_lines);
        });
    });
};
function viewLine(line_id) {
    get({
        table: 'scrap_line',
        where: {line_id: line_id}
    })
    .then(function ([line, options]) {
        set_innerText('line_id',        line.line_id);
        set_innerText('line_item',      line.size.item.description);
        set_innerText('line_size',      print_size(line.size));
        set_innerText('line_qty',       line.qty);
        set_innerText('line_createdAt', print_date(line.createdAt, true));
        set_innerText('line_updatedAt', print_date(line.updatedAt, true));
        set_href('btn_line_link',  `/scrap_lines/${line.line_id}`);
        set_href('line_item_link', `/items/${line.size.item_id}`);
        set_href('line_size_link', `/sizes/${line.size_id}`);
        set_href('line_user_link', `/users/${line.user_id}`);
    });
};
addReloadListener(getLines);
window.addEventListener('load', function () {
    addListener('filter_scrap_line_statuses', getLines, 'input');
    addListener('filter_scrap_line_size_1',   getLines, 'input');
    addListener('filter_scrap_line_size_2',   getLines, 'input');
    addListener('filter_scrap_line_size_3',   getLines, 'input');
    addListener('filter_scrap_line_item',     getLines, 'input');
    modalOnShow('line_view', function (event) {viewLine(event.relatedTarget.dataset.id)});
    add_sort_listeners('scrap_lines', getLines);
    getLines();
});