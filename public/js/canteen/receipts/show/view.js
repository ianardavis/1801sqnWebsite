function getReceipt() {
    get({
        table: 'receipt',
        query: [`"receipt_id":"${path[2]}"`]
    })
    .then(function ([receipt, options]) {
        set_breadcrumb({text: `${receipt.item.name} | ${print_date(receipt.createdAt, true)}`});
        set_innerText({id: 'item',      text: receipt.item.name});
        set_innerText({id: 'qty',       text: receipt.qty});
        set_innerText({id: 'cost',      text: `£${receipt.cost}`});
        set_innerText({id: 'createdAt', text: print_date(receipt.createdAt, true)});
        set_innerText({id: 'user',      text: print_user(receipt.user)});
        set_attribute({id: 'item_link', attribute: 'href', value: `/canteen_items/${receipt.item_id}`});
        set_attribute({id: 'user_link', attribute: 'href', value: `/users/${receipt.user_id}`});
    })
};
addReloadListener(getReceipt);