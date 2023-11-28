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
                    addCell(row, tableDate(receipt.createdAt));
                    addCell(row, {text: (receipt.item ? receipt.item.name : '***Unknown***')});
                    addCell(row, {text: receipt.qty});
                    addCell(row, {text: `£${receipt.cost}`});
                    addCell(row, {append: new Link(`/receipts/${receipt.receipt_id}`).e});
                } catch (error) {
                    console.error(`canteen/receipts/index/view.js | getReceipts | ${receipt}`);
                    console.error(`canteen/receipts/index/view.js | getReceipts | ${error}`);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getReceipts);
    addSortListeners('receipts', getReceipts);
    getReceipts();
});