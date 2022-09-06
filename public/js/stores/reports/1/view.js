function getSizes() {
    clear('tbl_stocks')
    .then(tbl_stocks => {
        get({
            table: 'stocks',
            lt: {column: 'qty', value: 0}
        })
        .then(function([result, options]) {
            let row_index = 0;
            result.stocks.forEach(stock => {
                let row = tbl_stocks.insertRow(-1);
                add_cell(row, {text: (stock.size ? (stock.size.item ? stock.size.item.description : '') : '')});
                add_cell(row, {text: (stock.size ? print_size(stock.size) : '')});
                add_cell(row, {
                    text: (stock.location ? stock.location.location : ''),
                    append: [
                        new Hidden_Input({
                            attributes: [
                                {field: 'name',  value: `counts[][${row_index}][stock_id]`},
                                {field: 'value', value: stock.stock_id}
                            ],
                            small: true
                        }).e
                    ]
                });
                add_cell(row, {text: stock.qty});
                add_cell(row, {append: [
                    new Number_Input({
                        attributes: [
                            {field: 'name',  value: `counts[][${row_index}][qty]`},
                            {field: 'value', value: '0'},
                            {field: 'min',   value: '0'},
                        ]
                    }).e
                ]});
                row_index++
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSizes);
    addFormListener(
        'adjustments',
        'PUT',
        '/stocks/counts',
        {onComplete: getSizes}
    );
});