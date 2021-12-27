function getItems() {
    clear('div_items')
    .then(div => {
        let p = document.createElement('p');
        p.setAttribute('id', 'col_headers');
        div.appendChild(p);
        get({table: 'items'})
        .then(function ([items, options]) {
            let item_index = 0;
            items.forEach(item => {
                let tbl = addItem(div, p, item.item_id, item.description);
                get({
                    table: 'sizes',
                    where: {
                        orderable: true,
                        item_id: item.item_id
                    },
                    item_index: item_index
                })
                .then(function ([sizes, options]) {
                    let size_index = 0;
                    sizes.forEach(size => {
                        let row   = tbl.insertRow(-1),
                            index = Number(`${String(options.item_index)}${String(size_index).padStart(5, '0')}`);
                        add_cell(row, {text: print_size(size), append: new Hidden({
                            attributes: [
                                {field: 'name',  value: `items[][${index}][size_id]`},
                                {field: 'value', value: size.size_id}
                            ]
                        }).e});
                        let page_cell = add_cell(row, {id: `${size.size_id}_page`}),
                            cell_cell = add_cell(row, {id: `${size.size_id}_cell`});
                        add_cell(row, {append: new Link({href: `/sizes/${size.size_id}`}).e});
                        get({
                            table: 'detail',
                            where: {
                                size_id: size.size_id,
                                name: 'Demand Page'
                            }
                        })
                        .then(function ([detail, options]) {
                            page_cell.innerText = detail.value;
                            addInput(page_cell, index, 'demand_page');
                        })
                        .catch(err => addInput(page_cell, index, 'demand_page'));
                        get({
                            table: 'detail',
                            where: {
                                size_id: size.size_id,
                                name: 'Demand Cell'
                            }
                        })
                        .then(function ([detail, options]) {
                            cell_cell.innerText = detail.value;
                            addInput(cell_cell, index, 'demand_cell');
                        })
                        .catch(err => addInput(cell_cell, index, 'demand_cell'));
                        size_index++;
                    });
                })
                .catch(err => console.log(err));
                item_index++;
            });
        });
    });
};
function addInput(cell, index, col) {
    cell.appendChild(new Input({
        attributes: [{field: 'name', value: `items[][${index}][${col}]`}]
    }).e);
}
function addItem(div, p, item_id, description) {
    let new_div = document.createElement('div'),
        btn = document.createElement('button'),
        div_h = document.createElement('h5'),
        div_table      = document.createElement('table'),
        div_table_head = document.createElement('thead'),
        div_table_body = document.createElement('tbody'),
        div_table_head_col1 = document.createElement('th'),
        div_table_head_col2 = document.createElement('th'),
        div_table_head_col3 = document.createElement('th'),
        div_table_head_col4 = document.createElement('th');
    new_div.setAttribute('id', `item-${item_id}`)
    new_div.classList.add('collapse');
    div_h.innerText = description;
    div_table.classList.add('table', 'table-sm', 'table-hover');
    div_table_head.classList.add('thead-dark');
    div_table_head_col1.innerText = 'Size';
    div_table_head_col1.classList.add('w-40');
    div_table_head_col2.innerText = 'Demand Page';
    div_table_head_col2.classList.add('w-40');
    div_table_head_col3.innerText = 'Demand Cell';
    div_table_head_col3.classList.add('w-20');
    div_table_head_col4.innerHTML = '<i class="fas fa-search"></i>';
    div_table_body.setAttribute('id', `tbl_${item_id}`);
    div_table_head.appendChild(div_table_head_col1);
    div_table_head.appendChild(div_table_head_col2);
    div_table_head.appendChild(div_table_head_col3);
    div_table_head.appendChild(div_table_head_col4);
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
addReloadListener(getItems);
window.addEventListener('load', function () {
    addFormListener(
        'items',
        'PUT',
        '/details',
        {onComplete: getItems}
    );
});