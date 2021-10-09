function getSizes() {
    clear('div_sizes')
    .then(div => {
        let p = document.createElement('p');
        p.setAttribute('id', 'col_headers');
        div.appendChild(p);
        get({
            table: 'sizes',
            query: ['orderable=1']
        })
        .then(function ([sizes, options]) {
            sizes.forEach(size => {
                let tbl = document.querySelector(`#tbl_${size.item_id}`);
                if (!tbl) tbl = addItem(div, p, size.item_id, size.item.description);
                let row = tbl.insertRow(-1);
                add_cell(row, {text: print_size(size)});
                add_cell(row, {id: `stock-${size.size_id}`});
                add_cell(row, {
                    append: new Link({
                        small: true,
                        href: `/sizes/${size.size_id}`
                    }).e
                });
                sum({
                    table: 'stocks',
                    query: [`size_id=${size.size_id}`]
                })
                .then(function([stock, options]) {
                    set_innerText({id: `stock-${size.size_id}`, value: stock || '0'});
                });
            });
        });
    });
};
function addItem(div, p, item_id, description) {
    let new_div = document.createElement('div'),
        btn = document.createElement('button'),
        div_h = document.createElement('h5'),
        div_table      = document.createElement('table'),
        div_table_head = document.createElement('thead'),
        div_table_body = document.createElement('tbody'),
        div_table_head_col1 = document.createElement('th'),
        div_table_head_col2 = document.createElement('th'),
        div_table_head_col3 = document.createElement('th');
    new_div.setAttribute('id', `item-${item_id}`)
    new_div.classList.add('collapse');
    div_h.innerText = description;
    div_table.classList.add('table', 'table-sm', 'table-hover');
    div_table_head.classList.add('thead-dark');
    div_table_head_col1.innerText = 'Size';
    div_table_head_col1.classList.add('w-90');
    div_table_head_col1.setAttribute('onclick', `sortTable(0, 'tbl_${item_id}')`);
    div_table_head_col2.innerText = 'In Stock';
    div_table_head_col2.classList.add('w-10');
    div_table_head_col2.setAttribute('onclick', `sortTable(1, 'tbl_${item_id}')`);
    div_table_head_col3.innerHTML = '<i class="fas fa-search"></i>';
    div_table_body.setAttribute('id', `tbl_${item_id}`);
    div_table_head.appendChild(div_table_head_col1);
    div_table_head.appendChild(div_table_head_col2);
    div_table_head.appendChild(div_table_head_col3);
    div_table.appendChild(div_table_head);
    div_table.appendChild(div_table_body);
    new_div.appendChild(div_h);
    new_div.appendChild(div_table);
    btn.classList.add('btn', 'm-1', 'collapsed');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-bs-toggle', 'collapse');
    btn.setAttribute('data-bs-target', `#item-${item_id}`);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', `item-${item_id}`);
    btn.innerText = description;
    div.appendChild(new_div);
    p.appendChild(btn);
    return div_table_body;
};
addReloadListener(getSizes);