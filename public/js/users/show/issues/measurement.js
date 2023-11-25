let index = 0;
function get_items() {
    clear('tbl_items')
    .then(tbl_items => {
        get({
            table: 'items',
            location: 'items/uniform'
        })
        .then(function ([result, options]) {
            result.items.forEach(item => {
                let row = tbl_items.insertRow(-1);
                add_cell(row, {append: new Checkbox({
                    small:    true,
                    listener: {event: 'input', func: get_sizes},
                    attributes: [
                        {field: 'data-item_id', value: item.item_id},
                        {field: 'data-index',   value: index}
                    ]
                }).e});
                add_cell(row, {text: item.description});
                add_cell(row, {id: `${item.item_id}_sizes`});
                add_cell(row, {id: `${item.item_id}_qty`});
                index++;
            });
        });
    });
};
function get_measurements() {
    let r = {};
    document.querySelectorAll('.measurement').forEach(e => {
        if (e.value) r[e.dataset.measurement] = Number(e.value);
    });
    return r;
};
function recommended_size(item_description, size, measurements) {
    let size1 = size.size1 || null,
        size2 = size.size2 || null,
        size3 = size.size3 || null;
    if (!isNaN(size1)) size1 = Number(size1);
    if (!isNaN(size2)) size2 = Number(size2);
    if (!isNaN(size3)) size3 = Number(size3);
    switch (item_description.toLowerCase()) {
        case 'beret':
            if (measurements.head && measurements.head === size1 - 1) return true;
            break;
        case 'tie':
            if (measurements.collar && (
                    (measurements.collar >  35 && size1 === 'long') ||
                    (measurements.collar <= 35 && size1 === 'short')
                )
            ) return true;
            break;
        case 'jumper, utility':
            if (measurements.chest && (
                    (                            measurements.chest <  74 && size1 ===  '74') ||
                    (measurements.chest >  74 && measurements.chest <  82 && size1 ===  '82') ||
                    (measurements.chest >  82 && measurements.chest <  88 && size1 ===  '88') ||
                    (measurements.chest >  88 && measurements.chest <  94 && size1 ===  '94') ||
                    (measurements.chest >  94 && measurements.chest < 100 && size1 === '100') ||
                    (measurements.chest > 100 && measurements.chest < 106 && size1 === '106') ||
                    (measurements.chest > 106 && measurements.chest < 112 && size1 === '112') ||
                    (measurements.chest > 112 && measurements.chest < 118 && size1 === '118') ||
                    (measurements.chest > 118 && measurements.chest < 124 && size1 === '124') ||
                    (measurements.chest > 124 && measurements.chest < 130 && size1 === '130') ||
                    (measurements.chest > 130                             && size1 === '136')
                )
            ) return true;
            break;
        case 'shirt, light blue, long sleeve, male':
            if (measurements.collar && measurements.collar === size1 - 1) return true;
            break;
        case 'shirt, working blue, long sleeve, male':
        case 'shirt, working blue, extra long sleeve, male':
            if (measurements.collar && (
                                                 measurements.collar <= 31 && size1 === '31' ||
                    measurements.collar >= 32 && measurements.collar <= 34 && size1 === '32' ||
                    measurements.collar >= 35 && measurements.collar <= 37 && size1 === '35' ||
                    measurements.collar >= 38 && measurements.collar <= 40 && size1 === '38' ||
                    measurements.collar >= 41 && measurements.collar <= 43 && size1 === '41' ||
                    measurements.collar >= 44 && measurements.collar <= 46 && size1 === '44' ||
                    measurements.collar >= 47                              && size1 === '47')
            ) return true;
            break;
        case 'belt, waist':
            if (size1 === '64/114') return true;
            break;
        };
    return false;
};
function get_sizes(event) {
    let item_id = event.target.dataset.item_id;
    clear(`${item_id}_sizes`)
    .then(sizes_cell => {
        clear(`${item_id}_qty`)
        .then(qty_cell => {
            if (event.target.checked) {
                get({
                    table: 'sizes',
                    where: {item_id: item_id},
                    index: event.target.dataset.index
                })
                .then(function ([result, options]) {
                    qty_cell.appendChild(new Text_Input({
                        attributes: [
                            {field: 'name',        value: `issues[sizes][][${options.index}][qty]`},
                            {field: 'value',       value: '1'},
                            {field: 'required',    value: true},
                            {field: 'placeholder', value: 'Enter Quantity'}
                        ]
                    }).e);
                    let sel_sizes = new Select({
                        attributes: [
                            {field: 'name',     value: `issues[sizes][][${options.index}][size_id]`},
                            {field: 'required', value: true}
                        ],
                        options: [{text: 'Select Size...', selected: true}]
                    }).e
                    let measurements = get_measurements(),
                        recommended  = false;
                    result.sizes.forEach(size => {
                        sel_sizes.appendChild(new Option({value: size.size_id, text: print_size(size)}).e);
                    })
                    sizes_cell.appendChild(sel_sizes);
                });
            };
        });
    });
};
window.addEventListener( "load", function () {
    add_listener('tbl_items', toggle_checkbox_on_row_click);
    modalOnShow('issue_measurement', get_items);
    add_listener('btn_measurement_search', get_sizes);
    enableButton('issue_measurement');
    addFormListener(
        'issue_measurement',
        'POST',
        '/issues',
        {onComplete: get_issues}
    );
    add_sort_listeners('sizes', get_sizes);
});