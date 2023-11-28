function getItems() {
    clear('tbl_sizes');
    let filterItems = document.querySelector('#filterItems') || {value: ''};
    listItems({
        ...(filterItems.value !== '' ? {like:  {description: filterItems.value}} : {})
    });
};
function getSizes() {
    function display_size_texts([item, options]) {
        setInnerText('size_text1', item.size_text1);
        setInnerText('size_text2', item.size_text2);
        setInnerText('size_text3', item.size_text3);
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
                    getStock(size.size_id)
                    .then(stock => {
                        let row = tbl_sizes.insertRow(-1);
                        addCell(row, {append: new Checkbox({
                            small: true,
                            attributes: [{field: 'data-id', value: size.size_id}]}).e
                        });
                        addCell(row, {text: size.size1});
                        addCell(row, (size.size2 ? {text: size.size2} : {}));
                        addCell(row, (size.size3 ? {text: size.size3} : {}));
                        addCell(row, {text: stock || '0'});
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
    } else alertToast('Source window not found');
};
window.addEventListener('load', function () {
    addListener('tbl_sizes', toggleCheckboxOnRowClick);
    addListener('btn_select',   selectSizes);
    addListener('sel_items',    getSizes, 'input');
    addListener('filterItems', getItems, 'input');
    addSortListeners('sizes', getSizes);
    getItems();
});