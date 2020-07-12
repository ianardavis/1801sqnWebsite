showOrders = (lines, options) => {
    try {
        let table_body    = document.querySelector('#orderTable'),
            order_count = document.querySelector('#order_count');
        order_count.innerText = lines.length || '0';
        table_body.innerHTML = '';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
            if (Number(line.order.ordered_for) === -1) add_cell(row, {text: 'Backing Stock'})
            else add_cell(row, {text: line.order._for.rank._rank + ' ' + line.order._for.full_name});
            add_cell(row, {text: line._qty});
            add_cell(row, {append: new Link({
                href: '/stores/orders/' + line.order_id,
                small: true
            }).link});
        });
        hide_spinner('order_lines');
    } catch (error) {
        console.log(error);
    };
};