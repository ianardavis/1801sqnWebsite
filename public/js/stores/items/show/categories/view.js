function get_categories() {
    clear('tbl_categories')
    .then(tbl_categories => {
        function add_line(category) {
            let row = tbl_categories.insertRow(-1);
            addCell(row, {text: category.category.category});
            addCell(row, {append: new Modal_Button(
                _search(),
                'category_view',
                [{field: 'id', value: category.item_category_id}]
            ).e});
        };
        get({
            table: 'item_categories',
            where: {item_id: path[2]},
            func:  get_categories
        })
        .then(function ([result, options]) {
            setCount('category', result.count);
            result.categories.forEach(category => {
                add_line(category);
            });
        });
    });
};
function viewCategory(category_id) {
    get({
        table: 'item_category',
        where: {item_category_id: category_id}
    })
    .then(function ([category, options]) {
        setInnerText('category_id',        category.category_id);
        setInnerText('item_category_id',   category.item_category_id);
        setInnerText('category_category',  category.category.category);
        setInnerText('category_createdAt', printDate(category.createdAt));
    });
};
window.addEventListener('load', function () {
    addListener('reload', get_categories);
    modalOnShow('category_view', function(event) {
        if (event.relatedTarget.dataset.id) {
            viewCategory(event.relatedTarget.dataset.id);

        } else {
            modalHide('category_view');

        };
    });
    addSortListeners('item_categories', get_categories);
    get_categories();
});