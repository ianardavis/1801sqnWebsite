function getStock() {
    get(
        function (stock, options) {
            try {
                clearElement('stockTable');
                let table_body  = document.querySelector('#stockTable');
                set_count({id: 'stock', count: stock.length});
                stock.forEach(stk => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: stk.location._location});
                    add_cell(row, {text: stk._qty});
                    add_cell(row, {append: new Link({
                        href: `javascript:show("stock",${stk.stock_id})`,
                        small: true}).e});
                });
            } catch (error) {
                console.log(error);
            };
        },
        {
            table: 'stock',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getStock);