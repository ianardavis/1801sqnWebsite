function getReceipts() {
    clear('tbl_receipts')
    .then(tbl_receipts => {
        get({
            table: 'receipts',
            where: {item_id: path[2]},
            func: getReceipts
        })
        .then(function ([result, options]) {
            set_count('receipt', result.count);
            result.receipts.forEach(receipt => {
                try {
                    let row = tbl_receipts.insertRow(-1);
                    add_cell(row, table_date(receipt.createdAt));
                    add_cell(row, {text: receipt.qty});
                    add_cell(row, {append: new Link(`/receipts/${receipt.receipt_id}`).e});
                } catch (error) {
                    console.error(`canteen/items/show/receipts/view.js | getReceipts | ${error}`);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getReceipts);
    add_sort_listeners('receipts', getReceipts);
    getReceipts();
});