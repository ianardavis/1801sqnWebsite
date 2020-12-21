function getStocks() {
    get(
        function (stocks, options) {
            try {
                let tbl_stock = document.querySelector('#tbl_stock');
                set_count({id: 'stock', count: stocks.length});
                if (tbl_stock) {
                    tbl_stock.innerHTML = '';
                    stocks.forEach(stock => {
                        let row = tbl_stock.insertRow(-1);
                        add_cell(row, {text: stock.location._location});
                        add_cell(row, {text: stock._qty});
                        add_cell(row, {append: new Link({
                            modal: 'stock_view',
                            data:  {field: 'stock_id', value: stock.stock_id},
                            small: true
                        }).e}
                        );
                    });
                };
            } catch (error) {console.log(error)};
        },
        {
            table: 'stocks',
            query: [`size_id=${path[3]}`]
        }
    );
};
function getStockView(stock_id, permissions) {
    get(
        function(stock, options) {
            set_innerText({id: 'stock_location', text: stock.location._location});
            set_innerText({id: '_qty',           text: stock._qty});
            set_innerText({id: 'stock_id',       text: stock.stock_id});
            if (permissions.edit === true || permissions.delete === true) {
                let stock_buttons = document.querySelector('#stock_buttons');
                if (stock_buttons) {
                    stock_buttons.innerHTML = '';
                    if (permissions.delete) {
                        stock_buttons.appendChild(
                            new Delete_Button({
                                path:       `/stores/stocks/${stock.stock_id}`,
                                descriptor: 'Stock',
                                float:      true,
                                options: {
                                    onComplete: [
                                        getStocks,
                                        function () {$('mdl_stock_view').modal('hide')}
                                    ]
                                }
                            }).e
                        );
                    };
                    if (permissions.edit) {
                        stock_buttons.appendChild(
                            new Button({
                                id:   'btn_stock_edit',
                                type: 'success',
                                html: '<i class="fas fa-pencil-alt"></i>',
                                click: edit_stock
                            }).e
                        );
                    };
                };
            };
        },
        {
            table: 'stock',
            query: [`stock_id=${stock_id}`],
            spinner: 'stock_view'
        }
    );
};
document.querySelector('#reload').addEventListener('click', getStocks);