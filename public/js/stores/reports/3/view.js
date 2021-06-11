function getSizes() {
    disable_button('action');
    let form = document.querySelector('#form_sizes');
    if (form) {
        form.innerHTML = '';
        let p = document.createElement('p'),
            supplier_id = document.querySelector('#sel_suppliers') || {value: ''};
        p.setAttribute('id', 'col_headers');
        form.appendChild(p);
        get({
            table: 'sizes',
            query: ['orderable=1', (supplier_id.value ? `supplier_id=${supplier_id.value}` : '')]
        })
        .then(function ([sizes, options]) {
            let row_index = 0;
            sizes.forEach(size => {
                let tbl = document.querySelector(`#tbl_${size.item_id}`);
                if (!tbl) tbl = addItem(form, p, size.item_id, size.item.description);
                let row = tbl.insertRow(-1);
                add_cell(row, {text: size.size});
                add_cell(row, {id: `stock-${size.size_id}`});
                add_cell(row, {id: `order-${size.size_id}`});
                add_cell(row, {id: `demanded-${size.size_id}`});
                add_cell(row, {append: [
                    new Input({
                        attributes: [
                            {field: 'type', value: 'number'},
                            {field: 'name', value: `orders[][${row_index}][qty]`},
                            {field: 'min',  value: '0'}
                        ],
                        small: true
                    }).e,
                    new Input({
                        attributes: [
                            {field: 'type',  value: 'hidden'},
                            {field: 'name',  value: `orders[][${row_index}][size_id]`},
                            {field: 'value', value: size.size_id}
                        ]
                    }).e
                ]});
                add_cell(row, {
                    append: new Link({
                        small: true,
                        href: `/sizes/${size.size_id}`
                    }).e
                });
                row_index++;
                sum({
                    table: 'stocks',
                    query: [`size_id=${size.size_id}`]
                })
                .then(function([stock, options]) {
                    set_innerText({id: `stock-${size.size_id}`, value: stock || '0'});
                });
                sum({
                    table: 'orders',
                    query: [`size_id=${size.size_id}`, 'status=1']
                })
                .then(function([orders, options]) {
                    set_innerText({id: `order-${size.size_id}`, value: orders || '0'});
                });
                sum({
                    table: 'demand_lines',
                    query: [`size_id=${size.size_id}`, 'status=1', 'status=2']
                })
                .then(function([demands, options]) {
                    set_innerText({id: `demanded-${size.size_id}`, value: demands || '0'});
                });
            });
            enable_button('action');
        });
    };
};
function getSuppliers() {
    listSuppliers({
        blank: true,
        blank_text: 'All',
        id_only: true
    });
};
function addItem(form, p, item_id, description) {
    let div = document.createElement('div'),
        btn = document.createElement('button'),
        div_h = document.createElement('h5'),
        div_table      = document.createElement('table'),
        div_table_head = document.createElement('thead'),
        div_table_body = document.createElement('tbody'),
        div_table_head_col1 = document.createElement('th'),
        div_table_head_col2 = document.createElement('th'),
        div_table_head_col3 = document.createElement('th'),
        div_table_head_col4 = document.createElement('th'),
        div_table_head_col5 = document.createElement('th'),
        div_table_head_col6 = document.createElement('th');
    div.setAttribute('id', `item-${item_id}`)
    div.classList.add('collapse');
    div_h.innerText = description;
    div_table.classList.add('table', 'table-sm', 'table-hover');
    div_table_head.classList.add('thead-dark');
    div_table_head_col1.innerText = 'Size';
    div_table_head_col1.classList.add('w-55');
    div_table_head_col1.setAttribute('onclick', `sortTable(0, 'tbl_${item_id}')`);
    div_table_head_col2.innerText = 'In Stock';
    div_table_head_col2.classList.add('w-10');
    div_table_head_col2.setAttribute('onclick', `sortTable(1, 'tbl_${item_id}')`);
    div_table_head_col3.innerText = 'On Order';
    div_table_head_col3.classList.add('w-10');
    div_table_head_col3.setAttribute('onclick', `sortTable(2, 'tbl_${item_id}')`);
    div_table_head_col4.innerText = 'Demanded';
    div_table_head_col4.classList.add('w-10');
    div_table_head_col4.setAttribute('onclick', `sortTable(3, 'tbl_${item_id}')`);
    div_table_head_col5.innerText = 'Order';
    div_table_head_col5.classList.add('w-15');
    div_table_head_col6.innerHTML = '<i class="fas fa-search"></i>';
    div_table_body.setAttribute('id', `tbl_${item_id}`);
    div_table_head.appendChild(div_table_head_col1);
    div_table_head.appendChild(div_table_head_col2);
    div_table_head.appendChild(div_table_head_col3);
    div_table_head.appendChild(div_table_head_col4);
    div_table_head.appendChild(div_table_head_col5);
    div_table_head.appendChild(div_table_head_col6);
    div_table.appendChild(div_table_head);
    div_table.appendChild(div_table_body);
    div.appendChild(div_h);
    div.appendChild(div_table);
    btn.classList.add('btn', 'm-1', 'collapsed');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-bs-toggle', 'collapse');
    btn.setAttribute('data-bs-target', `#item-${item_id}`);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', `item-${item_id}`);
    btn.innerText = description;
    form.appendChild(div);
    p.appendChild(btn);
    return div_table_body;
};
addReloadListener(getSizes);
window.addEventListener('load', function () {
    addListener('sel_suppliers', getSizes, 'change');
    addFormListener(
        'sizes',
        'POST',
        '/orders',
        {onComplete: getSizes}
    );
});