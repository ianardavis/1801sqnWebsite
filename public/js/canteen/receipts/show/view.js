function getReceipt() {
    get({
        table: 'receipt',
        where: {receipt_id: path[2]}
    })
    .then(function ([receipt, options]) {
        setBreadcrumb(`${receipt.item.name} | ${print_date(receipt.createdAt, true)}`);
        setInnerText('item',      receipt.item.name);
        setInnerText('qty',       receipt.qty);
        setInnerText('cost',      `£${receipt.cost}`);
        setInnerText('createdAt', print_date(receipt.createdAt, true));
        setInnerText('user',      print_user(receipt.user));
        setHREF('item_link', `/canteen_items/${receipt.item_id}`);
        setHREF('user_link', `/users/${receipt.user_id}`);
    })
};
window.addEventListener('load', function () {
    add_listener('reload', getReceipt);
});