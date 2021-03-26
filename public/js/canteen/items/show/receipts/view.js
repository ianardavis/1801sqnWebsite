function getReceipts() {
    get(
        {
            table: 'receipts',
            query: [`item_id=${path[2]}`]
        },
        function (receipts, options) {
            set_count({id: 'receipt', count: receipts.length || '0'});
            let tbl_receipts = document.querySelector('#tbl_receipts');
            if (tbl_receipts) {
                tbl_receipts.innerHTML = '';
                receipts.forEach(receipt => {
                    try {
                        let row = tbl_receipts.insertRow(-1);
                        add_cell(row, table_date(receipt.createdAt));
                        add_cell(row, {text: receipt._qty});
                        add_cell(row, {append: new Link({
                            href: `/canteen/receipts/${receipt.receipt_id}`,
                            small: true
                        }).e});
                    } catch (error) {
                        console.log(error);
                    };
                });
            };
        }
    )
};
document.querySelector('#reload').addEventListener('click', getReceipts);