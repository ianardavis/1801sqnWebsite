function getLocations() {
    disable_button('action');
    clear('form_stocks')
    .then(div => {
        let p = document.createElement('p');
        p.setAttribute('id', 'col_headers');
        div.appendChild(p);
        get({table: 'stocks'})
        .then(function ([stocks, options]) {
            let row_index = 0;
            stocks.forEach(stock => {
                let tbl = document.querySelector(`#tbl_${stock.location_id}`);
                if (!tbl) tbl = addItem(div, p, stock.location_id, stock.location.location);
                let row = tbl.insertRow(-1);
                add_cell(row, {text: stock.size.item.description});
                add_cell(row, {text: print_size(stock.size)});
                add_cell(row, {text: stock.qty || '0'});
                add_cell(row, {append: [
                    new Input({
                        attributes: [
                            {field: 'type', value: 'number'},
                            {field: 'name', value: `adjustments[][${row_index}][qty]`},
                            {field: 'min',  value: '0'}
                        ],
                        small: true
                    }).e,
                    new Input({
                        attributes: [
                            {field: 'type',  value: 'hidden'},
                            {field: 'name',  value: `adjustments[][${row_index}][stock_id]`},
                            {field: 'value', value: stock.stock_id}
                        ]
                    }).e,
                    new Input({
                        attributes: [
                            {field: 'type',  value: 'hidden'},
                            {field: 'name',  value: `adjustments[][${row_index}][type]`},
                            {field: 'value', value: 'Count'}
                        ]
                    }).e
                ]});
                add_cell(row, {append: new Link({href: `/stocks/${stock.stock_id}`}).e});
                row_index++;
            });
            enable_button('action');
        });
    });
};
function addItem(div, p, location_id, location) {
    let new_div = document.createElement('div'),
        btn     = document.createElement('button'),
        div_h5  = document.createElement('h5'),
        div_table      = document.createElement('table'),
        div_table_head = document.createElement('thead'),
        div_table_body = document.createElement('tbody'),
        div_table_head_col1 = document.createElement('th'),
        div_table_head_col2 = document.createElement('th'),
        div_table_head_col3 = document.createElement('th'),
        div_table_head_col4 = document.createElement('th'),
        div_table_head_col5 = document.createElement('th');;
    new_div.setAttribute('id', `location-${location_id}`)
    new_div.classList.add('collapse');
    div_h5.innerText = location;
    div_table.classList.add('table', 'table-sm', 'table-hover');
    div_table_head.classList.add('thead-dark');
    div_table_head_col1.innerText = 'Item';
    div_table_head_col1.classList.add('w-35');
    div_table_head_col1.setAttribute('onclick', `sortTable(0, 'tbl_${location_id}')`);
    div_table_head_col2.innerText = 'Size';
    div_table_head_col2.classList.add('w-40');
    div_table_head_col2.setAttribute('onclick', `sortTable(1, 'tbl_${location_id}')`);
    div_table_head_col3.innerText = 'In Stock';
    div_table_head_col3.classList.add('w-10');
    div_table_head_col3.setAttribute('onclick', `sortTable(2, 'tbl_${location_id}')`);
    div_table_head_col4.classList.add('w-15');
    div_table_head_col4.innerText = 'New Quantity';
    div_table_head_col5.innerHTML = '<i class="fas fa-search"></i>';
    div_table_body.setAttribute('id', `tbl_${location_id}`);
    div_table_head.appendChild(div_table_head_col1);
    div_table_head.appendChild(div_table_head_col2);
    div_table_head.appendChild(div_table_head_col3);
    div_table_head.appendChild(div_table_head_col4);
    div_table_head.appendChild(div_table_head_col5);
    div_table.appendChild(div_table_head);
    div_table.appendChild(div_table_body);
    new_div.appendChild(div_h5);
    new_div.appendChild(div_table);
    btn.classList.add('btn', 'm-1', 'collapsed');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-bs-toggle', 'collapse');
    btn.setAttribute('data-bs-target', `#location-${location_id}`);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', `location-${location_id}`);
    btn.innerText = location;
    div.appendChild(new_div);
    p.appendChild(btn);
    return div_table_body;
};
addReloadListener(getLocations);
window.addEventListener('load', function () {
    addFormListener(
        'stocks',
        'POST',
        '/adjustments',
        {onComplete: getLocations}
    );
});