function getItems() {
    clear('tbl_items')
    .then(tbl_items => {
        function addLine(item) {
            let row = tbl_items.insertRow(-1);
            addCell(row, {text: item.description});
            addCell(row, {append: new Link(`/items/${item.item_id}`).e});
        };
        get({
            table: 'items',
            like: filterItem('item'),
            func: getItems
        })
        .then(function ([result, options]) {
            result.items.forEach(addLine);
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getItems);
    addListener('filter_item_description', getItems, 'input');
    addSortListeners('items', getItems);
    getItems();
});