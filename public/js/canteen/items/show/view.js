function getItem() {
    get({
        table: 'canteen_item',
        query: [`item_id=${path[2]}`]
    })
    .then(function ([item, options]) {
        set_breadcrumb({text: item.name});
        set_innerText({id: 'item_name',    text: item.name});
        set_innerText({id: 'item_price',   text: `£${item.price}`});
        set_innerText({id: 'item_cost',    text: `£${item.cost}`});
        set_innerText({id: 'item_qty',     text: item.qty || '0'});
        set_innerText({id: 'item_current', text: yesno(item.current)});
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id))
    });
};
addReloadListener(getItem);