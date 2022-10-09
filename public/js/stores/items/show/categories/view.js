function getCategories() {
    clear('tbl_categories')
    .then(tbl_categories => {
        get({
            table: 'item_categories',
            where: {item_id: path[2]},
            func:  getCategories
        })
        .then(function ([result, options]) {
            set_count('category', result.count);
            result.categories.forEach(category => {
                let row = tbl_categories.insertRow(-1);
                add_cell(row, {text: category.category.category});
                add_cell(row, {append: new Modal_Button(
                    _search(),
                    'category_view',
                    [{field: 'id', value: category.item_category_id}]
                ).e});
            });
        });
    });
};
function viewCategory(category_id) {
    get({
        table:   'item_category',
        where:   {item_category_id: category_id},
        spinner: 'category_view'
    })
    .then(function ([category, options]) {
        set_innerText('category_id',        category.category_id);
        set_innerText('item_category_id',   category.item_category_id);
        set_innerText('category_category',  category.category.category);
        set_innerText('category_createdAt', print_date(category.createdAt));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getCategories);
    modalOnShow('category_view', function(event) {
        if (event.relatedTarget.dataset.id) {
            viewCategory(event.relatedTarget.dataset.id)
        } else modalHide('category_view');
    });
    add_sort_listeners('item_categories', getCategories);
    getCategories();
});