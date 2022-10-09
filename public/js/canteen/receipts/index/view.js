function getReceipts() {
    clear('tbl_receipts')
    .then(tbl_receipts => {
        get({
            table: 'receipts',
            func: getReceipts
        })
        .then(function ([results, options]) {
            results.receipts.forEach(receipt => {
                try {
                    let row = tbl_receipts.insertRow(-1);
                    add_cell(row, table_date(receipt.createdAt));
                    add_cell(row, {text: (receipt.item ? receipt.item.name : '***Unknown***')});
                    add_cell(row, {text: receipt.qty});
                    add_cell(row, {text: `£${receipt.cost}`});
                    add_cell(row, {append: new Link(`/receipts/${receipt.receipt_id}`).e});
                } catch (error) {
                    console.log(receipt);
                    console.log(error);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getReceipts);
    add_sort_listeners('receipts', getReceipts);
    getReceipts();
});