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
        let item_id = document.querySelector('#sel_items') || {value: ''};
        if (item_id.value) {
            let supplier_id = document.querySelector('#sel_suppliers') || {value: ''},
                where = {
                    item_id:   item_id.value,
                    orderable: true
                };
            if (supplier_id.value !== '') where.supplier_id = supplier_id.value;
            get({
                table: 'sizes',
                where: where
            })
            .then(function ([result, options]) {
                let row_index = 0;
                result.sizes.forEach(size => {
                    let row = tbl_sizes.insertRow(-1);
                    add_cell(row, {
                        text: size.size1,
                        append: [
                            new Input({
                                attributes: [
                                    {field: 'type',  value: 'hidden'},
                                    {field: 'name',  value: `orders[][${row_index}][size_id]`},
                                    {field: 'value', value: size.size_id}
                                ]
                            }).e
                        ]
                    });
                    add_cell(row, {text: size.size2});
                    add_cell(row, {text: size.size3});
                    add_cell(row, {id: `${size.size_id}_stocks`});
                    add_cell(row, {id: `${size.size_id}_orders`});
                    add_cell(row, {id: `${size.size_id}_demands`});
                    add_cell(row, {id: `${size.size_id}_issues`});
                    add_cell(row, {append: [
                        new Input({
                            attributes: [
                                {field: 'type', value: 'number'},
                                {field: 'name', value: `orders[][${row_index}][qty]`},
                                {field: 'min',  value: '0'}
                            ],
                            small: true
                        }).e
                    ]});
                    add_cell(row, {append: new Link({href: `/sizes/${size.size_id}`}).e});
                    row_index++;
                    get_stock(size.size_id)
                    .then(stock => set_innerText(`${size.size_id}_stocks`, stock || '0'));

                    sum({
                        table: 'orders',
                        where: {
                            size_id: size.size_id,
                            status: 1
                        }
                    })
                    .then(function([orders, options]) {
                        set_innerText(`${size.size_id}_orders`, orders || '0');
                    });

                    sum({
                        table: 'demand_lines',
                        where: {
                            size_id: size.size_id,
                            status: [1, 2]
                        }
                    })
                    .then(function([demands, options]) {
                        set_innerText(`${size.size_id}_demands`, demands || '0');
                    });

                    sum({
                        table: 'issues',
                        where: {
                            size_id: size.size_id,
                            status: [1, 2]
                        }
                    })
                    .then(function([issues, options]) {
                        set_innerText(`${size.size_id}_issues`, issues || '0');
                    });
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
addReloadListener(getSizes);
sort_listeners(
    'items',
    getItems,
    [
        {value: 'createdAt',   text: 'Created'},
        {value: 'description', text: 'Description', selected: true}
    ]
);
sort_listeners(
    'sizes',
    getSizes,
    [
        {value: 'createdAt', text: 'Created'},
        {value: 'size1',     text: 'Size 1', selected: true},
        {value: 'size2',     text: 'Size 2'},
        {value: 'size3',     text: 'Size 3'}
    ]
);
window.addEventListener('load', function () {
    getItems();
    addListener('sel_suppliers', getSizes, 'input');
    addListener('sel_items',     getSizes, 'input');
    addFormListener(
        'sizes',
        'POST',
        '/orders',
        {onComplete: getSizes}
    );
});