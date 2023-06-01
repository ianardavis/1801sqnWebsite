function getItems() {
    clear('tbl_sizes');
    let filter_items = document.querySelector('#filter_items') || {value: ''};
    listItems({
        ...(filter_items.value !== '' ? {like:  {description: filter_items.value}} : {})
    });
};
function getSizes() {
    function display_size_texts([item, options]) {
        set_innerText('size_text1', item.size_text1);
        set_innerText('size_text2', item.size_text2);
        set_innerText('size_text3', item.size_text3);
        return item;
    };

    clear('tbl_sizes')
    .then(tbl_sizes => {
        function show_sizes(item) {
            get({
                table: 'sizes',
                where: {item_id: item.item_id}
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
        };
        const sel_items = document.querySelector('#sel_items') || {value: ''};
        if (sel_items.value) {
            get({
                table: 'item',
                where: {item_id: sel_items.value}
            })
            .then(display_size_texts)
            .then(show_sizes);
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
window.addEventListener('load', function () {
    add_listener('tbl_sizes', toggle_checkbox_on_row_click);
    add_listener('btn_select',   selectSizes);
    add_listener('sel_items',    getSizes, 'input');
    add_listener('filter_items', getItems, 'input');
    add_sort_listeners('sizes', getSizes);
    getItems();
});