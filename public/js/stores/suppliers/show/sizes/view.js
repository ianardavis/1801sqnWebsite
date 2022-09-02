function getItems() {
    clear('sel_items')
    .then(sel_items => {
        sel_items.appendChild(new Option({text: '...Select Item'}).e);
        get({
            table: 'items',
            location: 'items/supplier',
            where: {supplier_id: path[2]}
        })
        .then(function ([result, options]) {
            set_count('item', result.count);
            result.items.forEach(item => {
                sel_items.appendChild(new Option({value: item.item_id, text: item.description}).e);
            });
        });
    });
};
function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        let item_id = document.querySelector('#sel_items') || {value: ''};
        if (item_id.value) {
            get({
                table: 'sizes',
                where: {
                    item_id: item_id.value,
                    supplier_id: path[2]
                },
                func: getSizes
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
        };
    });
};
addReloadListener(getItems);
sort_listeners(
    'items',
    getItems,
    [
        {value: '["description"]', text: 'Description', selected: true}
    ]
);
sort_listeners(
    'sizes',
    getSizes,
    [
        {value: '["size1"]', text: 'Size 1'},
        {value: '["size2"]', text: 'Size 2'},
        {value: '["size3"]', text: 'Size 3'},
    ]
);
window.addEventListener('load', function () {
    addListener('sel_items', getSizes, 'input');
});