function getItems() {
    clear_table('items')
    .then(tbl_items => {
        let current = document.querySelector('#current').value || {value: ''};
        get({
            table: 'canteen_items',
            query: [current.value]
        })
        .then(function ([items, options]) {
            console.log(items, options)
            items.forEach(item => {
                let row = tbl_items.insertRow(-1);
                add_cell(row, {text: item.name});
                add_cell(row, {text: `£${Number(item.price).toFixed(2)}`});
                add_cell(row, {text: item.qty || '0'});
                add_cell(row, {html: (item.current ? _check() : '')});
                add_cell(row, {append: new Link({
                    href: `/canteen_items/${item.item_id}`,
                    small: true
                }).e});
            });
        });
    });
};
addReloadListener(getItems);
window.addEventListener('load', function () {
    addListener('current', getItems, 'change');
});