function getItems() {
    clear('tbl_items')
    .then(tbl_items => {
        let current = document.querySelector('#current') || {value: ''},
            where   = null;
        if (current.value !== '') where = {current: true};
        get({
            table: 'canteen_items',
            where: where,
            func: getItems
        })
        .then(function ([results, options]) {
            results.items.forEach(item => {
                let row = tbl_items.insertRow(-1);
                add_cell(row, {text: item.name});
                add_cell(row, {text: `£${Number(item.price).toFixed(2)}`});
                add_cell(row, {text: item.qty || '0'});
                add_cell(row, {html: (item.current ? _check() : '')});
                add_cell(row, {append: new Link({href: `/canteen_items/${item.item_id}`}).e});
            });
        });
    });
};
addReloadListener(getItems);
sort_listeners(
    'canteen_items',
    getItems,
    [
        {value: '["name"]',    text: 'Name', selected: true},
        {value: '["price"]',   text: 'Price'},
        {value: '["qty"]',     text: 'Stock'},
        {value: '["current"]', text: 'Current'}
    ]
);
window.addEventListener('load', function () {
    addListener('current', getItems, 'change');
});