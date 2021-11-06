function getCategories() {
    clear('tbl_categories')
    .then(tbl_categories => {
        let sort_cols = tbl_categories.parentNode.querySelector('.sort') || null;
        get({
            table: 'item_categories',
            query: [`item_id=${path[2]}`],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([categories, options]) {
            categories.forEach(category => {
                let row = tbl_categories.insertRow(-1);
                add_cell(row, {text: category.category.category});
                add_cell(row, {append: new Button({
                    modal: 'category_view',
                    data: [{field: 'id', value: category.item_category_id}],
                    small: true
                }).e});
            });
        });
    });
};
function viewCategory(category_id) {
    get({
        table:   'item_category',
        query:   [`item_category_id=${category_id}`],
        spinner: 'category_view'
    })
    .then(function ([category, options]) {
        set_innerText({id: 'category_id',        text: category.category_id});
        set_innerText({id: 'item_category_id',   text: category.item_category_id});
        set_innerText({id: 'category_category',  text: category.category.category});
        set_innerText({id: 'category_createdAt', text: print_date(category.createdAt)});
    });
};
addReloadListener(getCategories);
window.addEventListener('load', function () {
    modalOnShow('category_view', function(event) {
        if (event.relatedTarget.dataset.id) {
            viewCategory(event.relatedTarget.dataset.id)
        } else modalHide('category_view');
    });
});