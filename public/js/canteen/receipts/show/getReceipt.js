function getReceipt() {
    get(
        {
            table: 'receipt',
            query: [`receipt_id=${path[3]}`]
        },
        function (receipt, options) {
            set_innerText({id: 'item',      text: receipt.item._name});
            set_innerText({id: '_qty',      text: receipt._qty});
            set_innerText({id: '_cost',     text: `£${receipt._cost}`});
            set_innerText({id: 'createdAt', text: print_date(receipt.createdAt, true)});
            set_innerText({id: 'user',      text: print_user(receipt.user)});
            set_attribute({id: 'item_link', attribute: 'href', value: `/canteen/items/${receipt.item_id}`});
            set_attribute({id: 'user_link', attribute: 'href', value: `/canteen/users/${receipt.user_id}`});
            set_breadcrumb({text: receipt.receipt_id});
        }
    )
};
document.querySelector('#reload').addEventListener('click', getReceipt);