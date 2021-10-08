
function get_items() {
    clear('issue_measurements')
    .then(tbl_issue_measurements => {
        get({
            table: 'items_uniform',
            query: []
        })
        .then(function ([items, options]) {
            items.forEach(item => {
                let row = tbl_issue_measurements.insertRow(-1);
                add_cell(row, {text: item.description});
                add_cell(row, {append: new Checkbox({
                    small: true,
                    attributes: [
                        {field: 'class', value: 'item_measurement'},
                        {field: 'value', value: item.item_id}
                    ]
                }).e})
            });
        });
    });
};
function get_measurements() {
    let r = {};
    document.querySelectorAll('.measurement').filter(e => e.value).forEach(e => r[e.dataset.measurement] = e.value);
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
                    let size_actions = [];
                    sizes.forEach(size => {
                        size_actions.push(new Promise(resolve => {
                            sum({
                                table: 'stocks',
                                query: [`size_id=${size.size_id}`]
                            })
                            .then(function ([stock, options]) {
                                resolve(new Option({text: `${print_size(size)} | Qty: ${stock}`, value: size.size_id}).e);
                            })
                            .catch(err => {
                                console.log('Error getting stock:');
                                console.log(err);
                                resolve(new Option({text: `${print_size(size)} | Qty: ?`, value: size.size_id}).e);
                            })
                        }))
                    });
                    Promise.all(size_actions)
                    .then(opt_sizes => {
                        let row = tbl_items_selected.insertRow(-1);
                        row.setAttribute('id', `row_${item.item_id}`);
                        add_cell(row, {text: item.description});
                        add_cell(row, {append: new Select({
                            small: true,
                            attributes: [{field: 'name', value: `issues[sizes][][${index}][size_id]`}],
                            options: opt_sizes
                        }).e});
                        add_cell(row, {append: new Input({
                            small: true,
                            attributes: [{field: 'name', value: `issues[sizes][][${index}][qty]`}]
                        }).e});
                        add_cell(row, {append: new Button({
                            small: true,
                            type: 'delete',
                            attributes: [{field: 'id', value: `btn_issue_measurement_${item.item_id}`}],
                            onClick: function () {removeID(`row_${item.item_id}`)}
                        }).e});
                        index++;
                    });
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    });
};
window.addEventListener( "load", function () {
    modalOnShow('issue_measurements', get_items);
    addListener('btn_measurement_search', get_sizes)
    enable_button('issue_measurement');
    addFormListener(
        'issue_',
        'POST',
        '/issues',
        {onComplete: getIssues}
    );
});