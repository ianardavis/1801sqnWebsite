function getCategories() {
    clear_table('categories')
    .then(tbl_categories => {
        get({
            table: 'item_categories',
            query: [`item_id=${path[2]}`]
        })
        .then(function ([categories, options]) {
            categories.forEach(category => {
                let row = tbl_categories.insertRow(-1);
                add_cell(row, {text: category.category.category});
                add_cell(row, {append: new Button({
                    modal: 'category_view',
                    data: {field: 'id', value: category.item_category_id},
                    small: true
                }).e});
            });
        });
    })
    .catch(err => console.log(err));
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
    $('#mdl_category_view').on('show.bs.modal', function(event) {
        if (event.relatedTarget.dataset.id) {
            viewCategory(event.relatedTarget.dataset.id)
        } else $('#mdl_category_view').modal('hide');
    });
});