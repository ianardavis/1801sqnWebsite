function getReceipts() {
    clear('tbl_receipts')
    .then(tbl_receipts => {
        get({
            table: 'receipts',
            ...sort_query(tbl_receipts)
        })
        .then(function ([receipts, options]) {
            receipts.forEach(receipt => {
                try {
                    let row = tbl_receipts.insertRow(-1);
                    add_cell(row, table_date(receipt.createdAt));
                    add_cell(row, {text: (receipt.item ? receipt.item.name : '***Unknown***')});
                    add_cell(row, {text: receipt.qty});
                    add_cell(row, {text: `£${receipt.cost}`});
                    add_cell(row, {append: new Link({href: `/receipts/${receipt.receipt_id}`}).e});
                } catch (error) {
                    console.log(receipt);
                    console.log(error);
                };
            });
        });
    });
};
document.querySelector('#reload').addEventListener('click', getReceipts);