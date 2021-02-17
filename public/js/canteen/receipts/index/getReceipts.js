function getReceipts() {
    get(
        {
            db:    'canteen',
            table: 'receipts'
        },
        function (receipts, options) {
            let tbl_receipts = document.querySelector('#tbl_receipts');
            if (tbl_receipts) {
                tbl_receipts.innerHTML = '';
                receipts.forEach(receipt => {
                    try {
                        let row = tbl_receipts.insertRow(-1);
                        add_cell(row, table_date(receipt.createdAt));
                        if (receipt.item) add_cell(row, {text: receipt.item._name})
                        else              add_cell(row, {text: '***Unknown***'});
                        add_cell(row, {text: receipt._qty});
                        add_cell(row, {text: `£${receipt._cost}`});
                        add_cell(row, {append: new Link({
                            href: `/canteen/receipts/${receipt.receipt_id}`,
                            small: true
                        }).e});
                    } catch (error) {
                        console.log(receipt);
                        console.log(error);
                    };
                });
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', getReceipts);