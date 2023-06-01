function getSizes() {
    clear('tbl_stocks')
    .then(tbl_stocks => {
        function add_line(stock, index) {
            let row = tbl_stocks.insertRow(-1);
            add_cell(row, {text: (stock.size ? (stock.size.item ? stock.size.item.description : '') : '')});
            add_cell(row, {text: (stock.size ? print_size(stock.size) : '')});
            add_cell(row, {
                text: (stock.location ? stock.location.location : ''),
                append: [
                    new Hidden_Input({
                        attributes: [
                            {field: 'name',  value: `counts[][${index}][stock_id]`},
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
                        {field: 'name',  value: `counts[][${index}][qty]`},
                        {field: 'value', value: '0'},
                        {field: 'min',   value: '0'},
                    ]
                }).e
            ]});
        };
        get({
            table: 'stocks',
            lt: {column: 'qty', value: 0}
        })
        .then(function([result, options]) {
            let index = 0;
            result.stocks.forEach(stock => {
                add_line(stock, index);
                index++
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getSizes);
    addFormListener(
        'adjustments',
        'PUT',
        '/stocks/counts',
        {onComplete: getSizes}
    );
});