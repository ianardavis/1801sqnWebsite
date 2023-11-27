function get_items() {
    clear('tbl_items')
    .then(tbl_items => {
        get({
            table:    'items',
            location: 'items/supplier',
            where:    {supplier_id: path[2]},
            func:     get_items
        })
        .then(function ([result, options]) {
            setCount('item', result.count);
            result.items.forEach(item => {
                let row = tbl_items.insertRow(-1);
                selectableRow(row, item.item_id, tbl_items, get_sizes);
                add_cell(row, {text: item.description});
            });
        });
    });
};
function get_sizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        let selected_item = document.querySelector('.selected_row');
        let where = { supplier_id: path[2] };
        if (selected_item) where.item_id = selected_item.dataset.row_id;
        get({
            table: 'sizes',
            where: where,
            func:  get_sizes
        })
        .then(function ([result, options]) {
            result.sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                add_cell(row, {text: size.size1});
                add_cell(row, {text: size.size2});
                add_cell(row, {text: size.size3});
                add_cell(row, {append: new Link(`/sizes/${size.size_id}`).e});
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', get_items);
    add_sort_listeners('items', get_items);
    add_sort_listeners('sizes', get_sizes);
    get_items();
});