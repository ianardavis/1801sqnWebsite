function getItems() {
    clear('tbl_sizes');
    let filter_items = document.querySelector('#filter_items') || {value: ''};
    listItems({
        ...(filter_items.value !== '' ? {like:  {description: filter_items.value}} : {})
    });
};
function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        let sel_items = document.querySelector('#sel_items') || {value: ''};
        if (sel_items.value) {
            get({
                table: 'item',
                where: {item_id: sel_items.value}
            })
            .then(function ([item, options]) {
                set_innerText('size_text1', item.size_text1);
                set_innerText('size_text2', item.size_text2);
                set_innerText('size_text3', item.size_text3);
                get({
                    table: 'sizes',
                    where: {item_id: sel_items.value}
                })
                .then(function ([result, options]) {
                    result.sizes.forEach(size => {
                        get_stock(size.size_id)
                        .then(stock => {
                            let row = tbl_sizes.insertRow(-1);
                            add_cell(row, {append: new Checkbox({
                                small: true,
                                attributes: [{field: 'data-id', value: size.size_id}]}).e
                            });
                            add_cell(row, {text: size.size1});
                            add_cell(row, (size.size2 ? {text: size.size2} : {}));
                            add_cell(row, (size.size3 ? {text: size.size3} : {}));
                            add_cell(row, {text: stock || '0'});
                        });
                    });
                });
            });
        };
    });
};
function selectSizes() {
    if (window.opener.selectedSizes) {
        let sizes = [];
        document.querySelectorAll("input[type='checkbox']:checked").forEach(e => {
            sizes.push(e.dataset.id);
            e.checked = false;
        });
        window.opener.selectedSizes(sizes);
    } else alert_toast('Source window not found');
};
sort_listeners(
    'items',
    getItems,
    [
        {value: '["createdAt"]',   text: 'Created'},
        {value: '["description"]', text: 'Description', selected: true}
    ]
);
sort_listeners(
    'sizes',
    getSizes,
    [
        {value: '["createdAt"]', text: 'Created'},
        {value: '["size1"]',     text: 'Size 1', selected: true},
        {value: '["size2"]',     text: 'Size 2'},
        {value: '["size3"]',     text: 'Size 3'}
    ]
);
window.addEventListener('load', function () {
    addListener('tbl_sizes', toggle_checkbox_on_row_click);
    addListener('btn_select',   selectSizes);
    addListener('sel_items',    getSizes, 'input');
    addListener('filter_items', getItems, 'input');
});