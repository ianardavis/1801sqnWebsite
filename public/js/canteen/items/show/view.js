function getItem() {
    get({
        table: 'canteen_item',
        where: {item_id: path[2]}
    })
    .then(function ([item, options]) {
        setBreadcrumb(item.name);
        setInnerText('item_name',    item.name);
        setInnerText('item_price',   `£${item.price}`);
        setInnerText('item_cost',    `£${item.cost}`);
        setInnerText('item_qty',     item.qty || '0');
        setInnerText('item_current', yesno(item.current));
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id))
    });
};
window.addEventListener('load', function () {
    addListener('reload', getItem);
});