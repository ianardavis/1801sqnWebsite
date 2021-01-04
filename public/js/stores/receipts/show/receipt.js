function getReceipt() {
    get(
        function (receipt, options) {
            set_innerText({id: `supplier`,      text: receipt.supplier._name});
            set_innerText({id: 'user',          text: print_user(receipt.user)});
            set_attribute({id: `supplier_link`, attribute: 'href', value: `/stores/suppliers/${receipt.supplier_id}`});
            set_attribute({id: 'user_link',     attribute: 'href', value: `/stores/users/${receipt.user_id}`});
            set_innerText({id: 'createdAt',     text: print_date(receipt.createdAt, true)});
            set_innerText({id: 'updatedAt',     text: print_date(receipt.updatedAt, true)});
            set_innerText({id: '_status',       text: statuses[receipt._status] || 'Unknown'});
            set_breadcrumb({
                text: receipt.receipt_id,
                href: `/stores/receipts/${receipt.receipt_id}`
            });
        },
        {
            table: 'receipt',
            query: [`receipt_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getReceipt);