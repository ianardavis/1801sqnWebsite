function get_items() {
    clear('tbl_items')
    .then(tbl_items => {
        get({table: 'items_uniform'})
        .then(function ([items, options]) {
            items.forEach(item => {
                let row = tbl_items.insertRow(-1);
                add_cell(row, {append: new Checkbox({
                    small: true,
                    input_classes: ['item_measurement'],
                    attributes: [{field: 'value', value: item.item_id}]
                }).e});
                add_cell(row, {text: item.description});
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
    if (!Number(size1) === NaN) size1 = Number(size1);
    if (!Number(size2) === NaN) size2 = Number(size2);
    if (!Number(size3) === NaN) size3 = Number(size3);
    switch (item_description.toLowerCase()) {
        case 'beret':
            if (measurements.head && 
                    measurements.head === size1 - 1
                ) return true;
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
                    (measurements.chest < 74                              && size1 === '74')  ||
                    (measurements.chest > 74  && measurements.chest < 82  && size1 === '82')  ||
                    (measurements.chest > 82  && measurements.chest < 88  && size1 === '88')  ||
                    (measurements.chest > 88  && measurements.chest < 94  && size1 === '94')  ||
                    (measurements.chest > 94  && measurements.chest < 100 && size1 === '100') ||
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
            if (measurements.collar && 
                    measurements.collar === size1 - 1
            ) return true;
            break;
        case 'shirt, working blue, long sleeve, male':
        case 'shirt, working blue, extra long sleeve, male':
            if (measurements.collar && (
                    measurements.collar <= 31                              && size1 === '31' ||
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
function get_sizes() {
    clear('tbl_items_selected')
    .then(tbl_items_selected => {
        show_spinner('issue_measurement');
        let index = 0,
            measurements = get_measurements();
        document.querySelector('#tbl_items').querySelectorAll("input[type='checkbox']:checked").forEach(e => {
            get({
                table: 'item',
                where: {item_id: e.value}
            })
            .then(function ([item, options]) {
                get({
                    table: 'sizes',
                    where: {
                        item_id: e.value,
                        issueable: true
                    }
                })
                .then(function ([sizes, options]) {
                    if (
                        item.description === 'Brassard' ||
                        item.description.includes('Belt')
                    ) {
                        sizes.forEach(size => {
                            return get_stock(size.size_id)
                            .then(stock => {
                                add_selected_row(
                                    tbl_items_selected,
                                    item,
                                    index,
                                    [new Option({
                                        text: `${print_size(size)} | Qty: ${stock}`,
                                        value: size.size_id
                                    }).e]
                                );
                                index++;
                            });
                        });
                    } else if (item.description === 'Beret') {
                        let size_options  = [],
                            badge_options = [],
                            actions       = [];
                        sizes.forEach(size => {
                            actions.push(new Promise(resolve => {
                                return get_stock(size.size_id)
                                .then(stock => {
                                    if (size.size1.includes('Badge')) {
                                        badge_options.push(
                                            new Option({
                                                text: `${print_size(size)} | Qty: ${stock}`,
                                                value: size.size_id
                                            }).e
                                        );
                                    } else {
                                        size_options.push(
                                            new Option({
                                                text:     `${print_size(size)} | Qty: ${stock}`,
                                                value:    size.size_id,
                                                selected: recommended_size(item.description, size, measurements)
                                            }).e
                                        );
                                    };
                                    resolve(true);
                                })
                            }));
                        });
                        Promise.all(actions)
                        .then(results => {
                            add_selected_row(tbl_items_selected, item, index, size_options);
                            index++;
                            add_selected_row(tbl_items_selected, item, index, badge_options);
                            index++;
                        });
                    } else {
                        let size_actions = [];
                        sizes.forEach(size => {
                            size_actions.push(new Promise(resolve => {
                                return get_stock(size.size_id)
                                .then(stock => {
                                    resolve(new Option({
                                        text:     `${print_size(size)} | Qty: ${stock}`,
                                        value:    size.size_id,
                                        selected: recommended_size(item.description, size, measurements)
                                    }).e)
                                });
                            }));
                        });
                        Promise.all(size_actions)
                        .then(opt_sizes => {
                            add_selected_row(tbl_items_selected, item, index, opt_sizes);
                            index++;
                        });
                    };
                    hide_spinner('issue_measurement');
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        });
    });
};
function add_selected_row(tbl, item, index, options) {
    options.unshift(new Option({text: 'Select Size ...'}).e);
    let row = tbl.insertRow(-1);
    row.setAttribute('id', `row_${item.item_id}`);
    add_cell(row, {text: item.description});
    add_cell(row, {append: new Select({
        small: true,
        attributes: [
            {field: 'name',     value: `issues[sizes][][${index}][size_id]`},
            {field: 'required', value: true}
        ],
        options: options
    }).e});
    add_cell(row, {append: new Input({
        small: true,
        attributes: [
            {field: 'name',  value: `issues[sizes][][${index}][qty]`},
            {field: 'value', value: '1'}
        ]
    }).e});
    add_cell(row, {append: new Button({
        small: true,
        type: 'delete',
        attributes: [{field: 'id', value: `btn_issue_measurement_${item.item_id}`}],
        onClick: function () {removeID(`row_${item.item_id}`)}
    }).e});
};
window.addEventListener( "load", function () {
    addListener('tbl_items', toggle_checkbox_on_row_click);
    modalOnShow('issue_measurement', get_items);
    addListener('btn_measurement_search', get_sizes)
    enable_button('issue_measurement');
    addFormListener(
        'issue_measurement',
        'POST',
        '/issues',
        {onComplete: getIssues}
    );
});