function getSizes() {
    clear('div_sizes')
    .then(div_sizes => {
        let p_head = new P({attributes: [{field: 'id', value: 'col_headers'}]}).e,
            p_body = new P({attributes: [{field: 'id', value: 'col_body'}]}).e,
            div_row = new Div({classes: ['row']}).e,
            div_col = new Div({classes: ['col-12', 'col-md-8', 'mx-auto']}).e;
        div_sizes.appendChild(p_head);
        div_col.appendChild(p_body);
        div_row.appendChild(div_col);
        div_sizes.appendChild(div_row);
        get({
            table: 'sizes',
            where: {supplier_id: path[2]}
        })
        .then(function ([sizes, options]) {
            set_count('size', sizes.length);
            sizes.forEach(size => {
                let tbl = document.querySelector(`#tbl_${size.item_id}`);
                if (!tbl) tbl = addItem(p_head, p_body, size.item);
                let row = tbl.insertRow(-1);
                add_cell(row, {text: size.size1});
                add_cell(row, {text: size.size2});
                add_cell(row, {text: size.size3});
                add_cell(row, {append: new Link({href: `/sizes/${size.size_id}`}).e});
            });
        });
    });
};
function addItem(p_head, p_body, item) {
    let div = new Div({
            attributes: [{field: 'id', value: `item-${item.item_id}`}],
            classes: ['collapse']
        }).e,
        table = new Table().e,
        head  = new THEAD().e,
        body  = new TBODY(item.item_id).e;
    head.appendChild(new TH({text: item.size_text1, width: '25'}).e);
    head.appendChild(new TH({text: item.size_text2, width: '25'}).e);
    head.appendChild(new TH({text: item.size_text3, width: '25'}).e);
    head.appendChild(new TH({html: '<i class="fas fa-search"></i>'}).e);
    table.appendChild(head);
    table.appendChild(body);
    div.appendChild(new H5({text: item.description}).e);
    div.appendChild(table);
    p_body.appendChild(div);
    p_head.appendChild(new Button({
        classes: ['m-1', 'collapsed'],
        data: [
            {field: 'bs-toggle', value: 'collapse'},
            {field: 'bs-target', value: `#item-${item.item_id}`}
        ],
        attributes: [
            {field: 'aria-expanded', value: 'false'},
            {field: 'aria-controls', value: `item-${item.item_id}`}
        ],
        text: item.description
    }).e);
    return body;
};
addReloadListener(getSizes);