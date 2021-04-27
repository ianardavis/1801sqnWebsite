function getItems() {
    listItems({
        select: 'items',
        id_only: true
    })
    .catch(err => console.log(err));
};
function getSizes(item_id) {
    clear_table('sizes')
    .then(tbl_sizes => {
        get({
            table: 'sizes',
            query: [`item_id=${item_id}`]
        })
        .then(function ([sizes, options]) {
            sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                add_cell(row, {append: new Checkbox({small: true, attributes: [{field: 'data-id', value: size.size_id}]}).e});
                add_cell(row, {text: size.size});
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
    } else alert('Source window not found');
};
window.addEventListener('load', function () {
    addListener('btn_select', selectSizes);
    addListener('sel_items',  function (event) {getSizes(this.value)}, 'change');
});