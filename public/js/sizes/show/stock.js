showStock = (stock, options) => {
    try {
        let table_body  = document.querySelector('#stockTable'),
            stock_count = document.querySelector('#stock_count');
        stock_count.innerText = stock.length || '0';
        table_body.innerHTML = '';
        stock.forEach(stk => {
            let row = table_body.insertRow(-1);
            add_cell(row, {text: stk.location._location});
            add_cell(row, {text: stk._qty});
            add_cell(row, {append: new Link({
                href: 'javascript:show("stock",' + stk.stock_id + ')',
                small: true}).e});
        });
        hide_spinner('stock');
    } catch (error) {
        console.log(error);
    };
};