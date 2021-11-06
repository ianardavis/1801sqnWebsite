function getReceipts() {
    clear('tbl_receipts')
    .then(tbl_receipts => {
        let sort_cols = tbl_receipts.parentNode.querySelector('.sort') || null;
        get({
            table: 'receipts',
            query: [`item_id=${path[2]}`],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([receipts, options]) {
            set_count({id: 'receipt', count: receipts.length || '0'});
            receipts.forEach(receipt => {
                try {
                    let row = tbl_receipts.insertRow(-1);
                    add_cell(row, table_date(receipt.createdAt));
                    add_cell(row, {text: receipt.qty});
                    add_cell(row, {append: new Link({
                        href: `/receipts/${receipt.receipt_id}`,
                        small: true
                    }).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
addReloadListener(getReceipts);