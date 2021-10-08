function get_items() {
    clear('tbl_items')
    .then(tbl_items => {
        get({
            table: 'items_uniform',
            query: []
        })
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
        if (e.value) r[e.dataset.measurement] = e.value;
    });
    return r;
};
function get_sizes() {
    clear('tbl_items_selected')
    .then(tbl_items_selected => {
        let index = 0,
            measurements = get_measurements();
        document.querySelector('#tbl_items').querySelectorAll("input[type='checkbox']:checked").forEach(e => {
            get({
                table: 'item',
                query: [`item_id=${e.value}`]
            })
            .then(function ([item, options]) {
                get({
                    table: 'sizes',
                    query: [`item_id=${e.value}`, 'issueable=1']
                })
                .then(function ([sizes, options]) {
                    if (item.description === 'Brassard') {let size_actions = [];
                        sizes.forEach(size => {
                            sum({
                                table: 'stocks',
                                query: [`size_id=${size.size_id}`]
                            })
                            .then(([stock, options]) => {
                                add_selected_row(
                                    tbl_items_selected,
                                    item,
                                    index,
                                    [new Option({text: `${print_size(size)} | Qty: ${stock}`, value: size.size_id}).e]
                                );
                                index++;
                            })
                            .catch(err => {
                                console.log('Error getting stock:');
                                console.log(err);
                                add_selected_row(
                                    tbl_items_selected,
                                    item,
                                    index,
                                    [new Option({text: `${print_size(size)} | Qty: ?`, value: size.size_id}).e]
                                );
                            })
                        });
                    } else if (item.description === 'Beret') {
                        let size_actions = [], badge_actions = [];
                        sizes.forEach(size => {
                            if (size.size1.includes('Badge')) {
                                badge_actions.push(new Promise(resolve => {
                                    sum({
                                        table: 'stocks',
                                        query: [`size_id=${size.size_id}`]
                                    })
                                    .then(([stock, options]) => resolve(new Option({text: `${print_size(size)} | Qty: ${stock}`, value: size.size_id}).e))
                                    .catch(err => {
                                        console.log('Error getting stock:');
                                        console.log(err);
                                        resolve(new Option({text: `${print_size(size)} | Qty: ?`, value: size.size_id}).e);
                                    })
                                }));
                            } else {
                                size_actions.push(new Promise(resolve => {
                                    sum({
                                        table: 'stocks',
                                        query: [`size_id=${size.size_id}`]
                                    })
                                    .then(([stock, options]) => resolve(new Option({text: `${print_size(size)} | Qty: ${stock}`, value: size.size_id}).e))
                                    .catch(err => {
                                        console.log('Error getting stock:');
                                        console.log(err);
                                        resolve(new Option({text: `${print_size(size)} | Qty: ?`, value: size.size_id}).e);
                                    })
                                }));
                            };
                        });
                        Promise.all(size_actions)
                        .then(opt_sizes => {
                            add_selected_row(tbl_items_selected, item, index, opt_sizes);
                            index++;
                            Promise.all(badge_actions)
                            .then(opt_badges => {
                                add_selected_row(tbl_items_selected, item, index, opt_badges);
                                index++;
                            });
                        });
                    } else {
                        let size_actions = [];
                        sizes.forEach(size => {
                            size_actions.push(new Promise(resolve => {
                                sum({
                                    table: 'stocks',
                                    query: [`size_id=${size.size_id}`]
                                })
                                .then(([stock, options]) => resolve(new Option({text: `${print_size(size)} | Qty: ${stock}`, value: size.size_id}).e))
                                .catch(err => {
                                    console.log('Error getting stock:');
                                    console.log(err);
                                    resolve(new Option({text: `${print_size(size)} | Qty: ?`, value: size.size_id}).e);
                                })
                            }));
                        });
                        Promise.all(size_actions)
                        .then(opt_sizes => {
                            add_selected_row(tbl_items_selected, item, index, opt_sizes);
                            index++;
                        });
                    };
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        });
    });
};
function add_selected_row(tbl, item, index, options) {
    let row = tbl.insertRow(-1);
    row.setAttribute('id', `row_${item.item_id}`);
    add_cell(row, {text: item.description});
    add_cell(row, {append: new Select({
        small: true,
        attributes: [{field: 'name', value: `issues[sizes][][${index}][size_id]`}],
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