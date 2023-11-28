function getReceipts() {
    clear('tbl_receipts')
    .then(tbl_receipts => {
        get({
            table: 'receipts',
            where: {item_id: path[2]},
            func: getReceipts
        })
        .then(function ([result, options]) {
            setCount('receipt', result.count);
            result.receipts.forEach(receipt => {
                try {
                    let row = tbl_receipts.insertRow(-1);
                    addCell(row, tableDate(receipt.createdAt));
                    addCell(row, {text: receipt.qty});
                    addCell(row, {append: new Link(`/receipts/${receipt.receipt_id}`).e});
                } catch (error) {
                    console.error(`canteen/items/show/receipts/view.js | getReceipts | ${error}`);
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