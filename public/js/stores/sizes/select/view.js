function getItems() {
    listItems({
        select: 'sel_items',
        id_only: true
    })
    .catch(err => console.log(err));
};
function getSizes(item_id) {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'item',
            query: [`item_id=${item_id}`]
        })
        .then(function ([item, options]) {
            set_innerText({id: 'size_text1', value: item.size_text1});
            set_innerText({id: 'size_text2', value: item.size_text2});
            set_innerText({id: 'size_text3', value: item.size_text3});
            get({
                table: 'sizes',
                query: [`item_id=${item_id}`]
            })
            .then(function ([sizes, options]) {
                sizes.forEach(size => {
                    get_stock(size.size_id)
                    .then(stock => {
                        let row = tbl_sizes.insertRow(-1);
                        add_cell(row, {append: new Checkbox({small: true, attributes: [{field: 'data-id', value: size.size_id}]}).e});
                        add_cell(row, {text: size.size1});
                        add_cell(row, (size.size2 ? {text: size.size2} : {}));
                        add_cell(row, (size.size3 ? {text: size.size3} : {}));
                        add_cell(row, {text: stock || '0'});
                    });
                });
            });
        });
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
    addListener('tbl_sizes', toggle_checkbox_on_row_click)
    addListener('btn_select', selectSizes);
    addListener('sel_items',  function (event) {getSizes(this.value)}, 'change');
    addListener('filter_items', function () {filter_select('filter_items', 'sel_items')}, 'input');
});