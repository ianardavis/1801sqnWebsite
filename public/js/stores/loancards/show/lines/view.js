let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function get_lines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        function add_line(line, index) {
            try {
                let qty = 0;
                let open_qty = 0;
                line.issues.forEach(issue => {
                    qty += issue.qty
                    if (issue.status >= 1 && issue.status <= 4) open_qty += issue.qty;
                });
                let row = tbl_lines.insertRow(-1);
                add_cell(row, {text: line.size.item.description});
                add_cell(row, {text: print_size(line.size)});
                add_cell(row, {text: qty});
                add_cell(row, {text: open_qty.toString()});
                add_cell(row, {
                    text: line_statuses[line.status],
                    append: new Hidden_Input({
                        attributes: [
                            {field: 'name',  value: `lines[][${index}][line_id]`},
                            {field: 'value', value: line.line_id}
                        ]
                    }).e
                });
                
                let radios = new Div({classes: ['d-flex', 'align-items-start']}).e;
                if (line.status === 1 || line.status === 2) {
                    if (typeof nil_radio === 'function') {
                        radios.appendChild(nil_radio(line.line_id, index));

                        if (line.status === 1) {
                            if (
                                typeof cancel_options === 'function' &&
                                typeof cancel_radio   === 'function'
                            ) {
                                radios.appendChild(cancel_radio(line.line_id, index, cancel_options));
                            };
                        };
    
                        if (line.status === 2) {
                            if (
                                typeof return_options === 'function' &&
                                typeof return_radio   === 'function'
    
                            ) {
                                radios.appendChild(return_radio(line.line_id, index, return_options));
                            };
                        };
                    };
                };
                add_cell(row, {append: [radios, div_details(line.line_id, index)]});
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
                console.error(`Error loading line ${line.line_id}:`)
                console.error(error);
            };
        };
        let sel_status = document.querySelector('#sel_status') || {value: ''},
            where = {loancard_id: path[2]};
        if (sel_status.value !== '') where.status = sel_status.value;
        get({
            table: 'loancard_lines',
            where: where,
            func: get_lines
        })
        .then(function ([result, options]) {
            set_count('line', result.count);
            let index = 0;
            result.lines.forEach(line => {
                add_line(line, index);
                index++
            });
            return true;
        });
    });
};
function view_line(line_id) {
    function display_details([line, options]) {
        set_innerText('line_id',        line.line_id);
        set_innerText('line_item',      line.size.item.description);
        set_innerText('line_size',      print_size(line.size));
        set_innerText('line_qty',       line.qty);
        set_innerText('line_user',      print_user(line.user));
        set_innerText('line_createdAt', print_date(line.createdAt, true));
        set_innerText('line_updatedAt', print_date(line.updatedAt, true));
        return line;
    };
    function set_links(line) {
        set_href('btn_line_link',  `/loancard_lines/${line.line_id}`);
        set_href('line_item_link', `/items/${line.size.item_id}`);
        set_href('line_size_link', `/sizes/${line.size_id}`);
        set_href('line_user_link', `/users/${line.user_id}`);
        return line;
    };
    get({
        table: 'loancard_line',
        where: {line_id: line_id}
    })
    .then(display_details)
    .then(set_links);
};
window.addEventListener('load', function () {
    add_listener('reload', get_lines);
    add_listener('sel_status', get_lines, 'change');
    modalOnShow('line_view', function (event) {view_line(event.relatedTarget.dataset.id)});
    get_lines();
});