let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    disable_button('lines_action');
    clear('tbl_lines')
    .then(tbl_lines => {
        let sel_status = document.querySelector('#sel_status') || {value: ''},
            query      = [`"loancard_id":"${path[2]}"`];
        if (sel_status.value !== '') query.push(sel_status.value);
        get({
            table: 'loancard_lines',
            query: query,
            ...sort_query(tbl_lines)
        })
        .then(function ([lines, options]) {
            set_count('line', lines.length || '0');
            let row_index = 0;
            lines.forEach(line => {
                try {
                    let row = tbl_lines.insertRow(-1);
                    add_cell(row, {text: line.size.item.description});
                    add_cell(row, {text: print_size(line.size)});
                    add_cell(row, {text: line.qty});
                    add_cell(row, {
                        text: line_statuses[line.status],
                        append: new Input({
                            attributes: [
                                {field: 'type',  value: 'hidden'},
                                {field: 'name',  value: `lines[][${row_index}][loancard_line_id]`},
                                {field: 'value', value: line.loancard_line_id}
                            ]
                        }).e
                    });
                    let radios = [];
                    if (line.status === 1 || line.status === 2) radios.push(
                        new Radio({
                            id: `${line.loancard_line_id}_nil`,
                            float_start: true,
                            classes: ['radio_nil'],
                            colour: 'primary',
                            html: '<i class="fas fa-question"></i>',
                            listener: {event: 'input', func: function () {clear(`${line.loancard_line_id}_details`)}},
                            attributes: [
                                {field: 'name',     value: `lines[][${row_index}][status]`},
                                {field: 'checked',  value: true},
                                {field: 'disabled', value: true}
                            ]
                        }).e
                    );
                    if (line.status === 1) radios.push(
                        new Radio({
                            id: `${line.loancard_line_id}_cancel`,
                            float_start: true,
                            classes: ['radio_cancel'],
                            colour: 'danger',
                            html: '<i class="fas fa-trash-alt"></i>',
                            attributes: [
                                {field: 'name',     value: `lines[][${row_index}][status]`},
                                {field: 'value',    value: '0'},
                                {field: 'disabled', value: true}
                            ]
                        }).e
                    );
                    if (line.status === 2) radios.push(
                        new Radio({
                            id: `${line.loancard_line_id}_return`,
                            float_start: true,
                            classes: ['radio_return'],
                            html: '<i class="fas fa-undo-alt"></i>',
                            attributes: [
                                {field: 'name',                  value: `lines[][${row_index}][status]`},
                                {field: 'value',                 value: '3'},
                                {field: 'data-loancard_line_id', value: line.loancard_line_id},
                                {field: 'data-index',            value: row_index},
                                {field: 'disabled',              value: true}
                            ],
                            ...(typeof return_options === 'function' ? {listener: {event: 'input', func: return_options}}: {})
                        }).e
                    );
                    radios.push(new Div({attributes: [{field: 'id', value: `${line.loancard_line_id}_details`}]}).e);
                    add_cell(row, {append: radios});
                    add_cell(row, {append: 
                        new Button({
                            modal: 'line_view',
                            data: [{
                                field: 'id',
                                value: line.loancard_line_id
                            }]
                        }).e
                    });
                } catch (error) {
                    console.log(`Error loading line ${line.loancard_line_id}:`)
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
function viewLine(loancard_line_id) {
    get({
        table: 'loancard_line',
        query: [`"loancard_line_id":"${loancard_line_id}"`]
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
addReloadListener(getLines);
window.addEventListener('load', function () {
    addListener('sel_status', getLines, 'change');
    modalOnShow('line_view', function (event) {viewLine(event.relatedTarget.dataset.id)});
});