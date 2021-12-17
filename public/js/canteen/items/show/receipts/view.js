function getReceipts() {
    clear('tbl_receipts')
    .then(tbl_receipts => {
        get({
            table: 'receipts',
            where: {item_id: path[2]}
        })
        .then(function ([receipts, options]) {
            set_count('receipt', receipts.length);
            receipts.forEach(receipt => {
                try {
                    let row = tbl_receipts.insertRow(-1);
                    add_cell(row, table_date(receipt.createdAt));
                    add_cell(row, {text: receipt.qty});
                    add_cell(row, {append: new Link({href: `/receipts/${receipt.receipt_id}`}).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
addReloadListener(getReceipts);