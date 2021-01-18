let statuses = {"0": "Cancelled", "1": "Open", "2": "Complete"};
function getReceipts() {
    let sel_status = document.querySelector('#sel_status');
    get(
        function (receipts, options) {
            clearElement('tbl_receipts');
            let table_body = document.querySelector('#tbl_receipts');
            receipts.forEach(receipt => {
                let row = table_body.insertRow(-1);
                add_cell(row, table_date(receipt.createdAt));
                add_cell(row, {text: print_user(receipt.user)});
                add_cell(row, {text: statuses[receipt._status]});
                add_cell(row, {append: new Link({
                    href: `/canteen/receipts/${receipt.receipt_id}`,
                    small: true
                }).e});
            });
        },
        {
            db: 'canteen',
            table: 'receipts',
            query: [sel_status.value]
        }
    );
};
document.querySelector('#sel_status').addEventListener('change', getReceipts);
document.querySelector('#reload').addEventListener('click', getReceipts);