let receipt_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Closed'};
function getReceipts() {
    let sel_suppliers = document.querySelector('#sel_suppliers') || {value: ''},
        sel_status 	  = document.querySelector('#sel_status')    || {value: ''};
    get(
        function (receipts, options) {
            let table_body = document.querySelector('#tbl_receipts');
            if (table_body) {
                table_body.innerHTML = '';
                receipts.forEach(receipt => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: receipt.supplier._name});
                    add_cell(row, {text: print_date(receipt.createdAt)});
                    add_cell(row, {text: receipt.lines.length || '0'});
                    add_cell(row, {text: receipt_statuses[String(receipt._status)]});
                    add_cell(row, {append: new Link({href: `/stores/receipts/${receipt.receipt_id}`, small: true}).e});
                });
            };
        },
        {
            table: 'receipts',
            query: [sel_status.value, sel_suppliers.value]
        }
    );
};
document.querySelector('#reload')		.addEventListener('click',  getReceipts);
document.querySelector('#sel_status')	.addEventListener('change', getReceipts);
document.querySelector('#sel_suppliers').addEventListener('change', getReceipts);