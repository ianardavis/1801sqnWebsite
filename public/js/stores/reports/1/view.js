function getSizes() {
    disable_button('action');
    clear('tbl_stocks')
    .then(tbl_stocks => {
        let sort_cols = tbl_stocks.parentNode.querySelector('.sort') || null;
        get({
            table: 'negative_stock',
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function([stocks, options]) {
            let row_index = 0;
            stocks.forEach(stock => {
                let row = tbl_stocks.insertRow(-1);
                add_cell(row, {text: (stock.size ? (stock.size.item ? stock.size.item.description : '') : '')});
                add_cell(row, {text: (stock.size ? print_size(stock.size) : '')});
                add_cell(row, {text: (stock.location ? stock.location.location : '')});
                add_cell(row, {text: stock.qty});
                add_cell(row, {append: [
                    new Input({
                        attributes: [
                            {field: 'type',  value: 'number'},
                            {field: 'name',  value: `adjustments[][${row_index}][qty]`},
                            {field: 'value', value: '0'},
                            {field: 'min',   value: '0'},
                        ],
                        small: true
                    }).e,
                    new Input({
                        attributes: [
                            {field: 'type',  value: 'hidden'},
                            {field: 'name',  value: `adjustments[][${row_index}][stock_id]`},
                            {field: 'value', value: stock.stock_id}
                        ],
                        small: true
                    }).e,
                    new Input({
                        attributes: [
                            {field: 'type',  value: 'hidden'},
                            {field: 'name',  value: `adjustments[][${row_index}][type]`},
                            {field: 'value', value: 'Count'}
                        ],
                        small: true
                    }).e
                ]});
                row_index++
            });
            enable_button('action');
        });
    });
};
addReloadListener(getSizes);
window.addEventListener('load', function () {
    addFormListener(
        'adjustments',
        'POST',
        '/adjustments',
        {onComplete: getSizes}
    );
});