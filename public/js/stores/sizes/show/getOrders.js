function getOrders() {
    get(
        function (lines, options) {
            let table_body  = document.querySelector('#tbl_orders');
            set_count({id: 'order', count: lines.length});
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    try {
                        let row = table_body.insertRow(-1);
                        if (Number(line.order.user_id_order) === -1) add_cell(row, {text: 'Backing Stock'})
                        else add_cell(row, {text: print_user(line.order.user_id_order)});
                        add_cell(row, {text: line._qty});
                        add_cell(row, {append: new Link({
                            href: `/stores/orders/${line.order_id}`,
                            small: true
                        }).e});
                    } catch (error) {
                        console.log(error);
                    };
                });
            };
        },
        {
            table: 'order_lines',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getOrders);