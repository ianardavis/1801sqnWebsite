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
                addCell(row, {text: item.name});
                addCell(row, {text: `£${Number(item.price).toFixed(2)}`});
                addCell(row, {text: item.qty || '0'});
                addCell(row, {html: (item.current ? _check() : '')});
                addCell(row, {append: new Link(`/canteen_items/${item.item_id}`).e});
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getItems);
    addListener('current', getItems, 'change');
    addSortListeners('canteen_items', getItems);
    getItems();
});