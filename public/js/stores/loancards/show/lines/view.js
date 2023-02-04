let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        let sel_status = document.querySelector('#sel_status') || {value: ''},
            where = {loancard_id: path[2]};
        if (sel_status.value !== '') where.status = sel_status.value;
        get({
            table: 'loancard_lines',
            where: where,
            func: getLines
        })
        .then(function ([result, options]) {
            set_count('line', result.count);
            let row_index = 0;
            result.lines.forEach(line => {
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
                                {field: 'name',  value: `lines[][${row_index}][loancard_line_id]`},
                                {field: 'value', value: line.loancard_line_id}
                            ]
                        }).e
                    });
                    
                    let radios = new Div({classes: ['d-flex', 'align-items-start']}).e;
                    if (line.status === 1 || line.status === 2) {
                        if (typeof nil_radio === 'function') {
                            radios.appendChild(nil_radio(line.loancard_line_id, row_index));

                            if (line.status === 1) {
                                if (
                                    typeof cancel_options === 'function' &&
                                    typeof cancel_radio   === 'function'
                                ) {
                                    radios.appendChild(cancel_radio(line.loancard_line_id, row_index, cancel_options));
                                };
                            };
        
                            if (line.status === 2) {
                                if (
                                    typeof return_options === 'function' &&
                                    typeof return_radio   === 'function'
        
                                ) {
                                    radios.appendChild(return_radio(line.loancard_line_id, row_index, return_options));
                                };
                            };
                        };
                    };
                    add_cell(row, {append: [radios, div_details(line.loancard_line_id, row_index)]});
                    add_cell(row, {append: 
                        new Modal_Button(
                            _search(),
                            'line_view',
                            [{
                                field: 'id',
                                value: line.loancard_line_id
                            }]
                        ).e
                    });
                } catch (error) {
                    console.log(`Error loading line ${line.loancard_line_id}:`)
                    console.log(error);
                };
                row_index++
            });
            return true;
        });
    });
};
function viewLine(loancard_line_id) {
    get({
        table: 'loancard_line',
        where: {loancard_line_id: loancard_line_id}
    })
    .then(function ([line, options]) {
        set_innerText('loancard_line_id', line.loancard_line_id);
        set_innerText('line_item',        line.size.item.description);
        set_innerText('line_size',        print_size(line.size));
        set_innerText('line_qty',         line.qty);
        set_innerText('line_user',        print_user(line.user));
        set_innerText('line_createdAt',   print_date(line.createdAt, true));
        set_innerText('line_updatedAt',   print_date(line.updatedAt, true));
        set_href('btn_line_link',  `/loancard_lines/${line.loancard_line_id}`);
        set_href('line_item_link', `/items/${line.size.item_id}`);
        set_href('line_size_link', `/sizes/${line.size_id}`);
        set_href('line_user_link', `/users/${line.user_id}`);
    });
};
window.addEventListener('load', function () {
    addListener('reload', getLines);
    addListener('sel_status', getLines, 'change');
    modalOnShow('line_view', function (event) {viewLine(event.relatedTarget.dataset.id)});
    getLines();
});