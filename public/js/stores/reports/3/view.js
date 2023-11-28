function getItems() {
    listItems({
        select:  'sel_items',
        blank:   {text: 'Select Item...'},
        id_only: true
    });
};
function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        function add_line(size, index) {
            let row = tbl_sizes.insertRow(-1);
            addCell(row, {
                text: size.size1,
                append: [
                    new Hidden_Input({
                        attributes: [
                            {field: 'name',  value: `orders[][${index}][size_id]`},
                            {field: 'value', value: size.size_id}
                        ]
                    }).e
                ]
            });
            addCell(row, {text: size.size2});
            addCell(row, {text: size.size3});
            addCell(row, {id: `${size.size_id}_stocks`});
            addCell(row, {id: `${size.size_id}_orders`});
            addCell(row, {id: `${size.size_id}_demands`});
            addCell(row, {id: `${size.size_id}_issues`});
            addCell(row, {append: [
                new Number_Input({
                    attributes: [
                        {field: 'name', value: `orders[][${index}][qty]`},
                        {field: 'min',  value: '0'}
                    ]
                }).e
            ]});
            addCell(row, {append: new Link(`/sizes/${size.size_id}`).e});
        };
        function getStock_count(size_id) {
            getStock(size_id)
            .then(stock => setInnerText(`${size_id}_stocks`, stock || '0'));
        };
        function get_order_sum(size_id) {
            get({
                action: 'sum',
                table: 'orders',
                where: {
                    size_id: size_id,
                    status: 1
                }
            })
            .then(function([orders, options]) {
                setInnerText(`${size_id}_orders`, orders || '0');
            });
        };
        function get_issue_sum(size_id) {
            get({
                action: 'sum',
                table: 'issues',
                where: {
                    size_id: size_id,
                    status: [1, 2]
                }
            })
            .then(function([issues, options]) {
                setInnerText(`${size_id}_issues`, issues || '0');
            });
        };
        function get_demand_line_qty(size_id) {
            get({
                table: 'demand_lines',
                where: {
                    size_id: size_id,
                    status: [1, 2]
                }
            })
            .then(function([results, options]) {
                let qty = 0;
                results.lines.forEach(demand_line => {
                    demand_line.orders.forEach(order => {
                        qty += order.qty;
                    });
                });
                setInnerText(`${size_id}_demands`, qty);
            });
        };

        const item_id = document.querySelector('#sel_items') || {value: ''};
        if (item_id.value) {
            const supplier_id = document.querySelector('#sel_suppliers') || {value: ''};
            let where = {
                    item_id:   item_id.value,
                    orderable: true
                };
            if (supplier_id.value !== '') where.supplier_id = supplier_id.value;
            get({
                table: 'sizes',
                where: where
            })
            .then(function ([result, options]) {
                let index = 0;
                result.sizes.forEach(size => {
                    add_line(size, index);
                    getStock_count(size.size_id);
                    get_order_sum(size.size_id);
                    get_issue_sum(size.size_id);
                    get_demand_line_qty(size.size_id);
                    index++;
                });
            });
        };
    })
};
function getSuppliers() {
    listSuppliers({
        blank: true,
        blank_text: 'All',
        id_only: true
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSizes);
    addListener('sel_suppliers', getSizes, 'input');
    addListener('sel_items',     getSizes, 'input');
    addFormListener(
        'sizes',
        'POST',
        '/orders',
        {onComplete: getSizes}
    );
    addSortListeners('sizes', getSizes);
    getItems();
    getSizes();
});