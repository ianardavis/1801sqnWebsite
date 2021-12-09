function getReceipt() {
    get({
        table: 'receipt',
        query: [`"receipt_id":"${path[2]}"`]
    })
    .then(function ([receipt, options]) {
        set_breadcrumb(`${receipt.item.name} | ${print_date(receipt.createdAt, true)}`);
        set_innerText('item',      receipt.item.name);
        set_innerText('qty',       receipt.qty);
        set_innerText('cost',      `£${receipt.cost}`);
        set_innerText('createdAt', print_date(receipt.createdAt, true));
        set_innerText('user',      print_user(receipt.user));
        set_href('item_link', `/canteen_items/${receipt.item_id}`);
        set_href('user_link', `/users/${receipt.user_id}`);
    })
};
addReloadListener(getReceipt);