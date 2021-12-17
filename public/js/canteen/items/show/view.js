function getItem() {
    get({
        table: 'canteen_item',
        where: {item_id: path[2]}
    })
    .then(function ([item, options]) {
        set_breadcrumb(item.name);
        set_innerText('item_name',    item.name);
        set_innerText('item_price',   `£${item.price}`);
        set_innerText('item_cost',    `£${item.cost}`);
        set_innerText('item_qty',     item.qty || '0');
        set_innerText('item_current', yesno(item.current));
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id))
    });
};
addReloadListener(getItem);