let categories_loaded = [];
function getCategories(parent_id = '') {
    categories_loaded.push({id: parent_id, status: false});
    clear(`ul_category_${parent_id}`)
    .then(ul_category => {
        get({
            table: 'categories',
            where: {category_id_parent: parent_id}
        })
        .then(function ([results, options]) {
            if (results.categories.length === 0) {
                let span = document.querySelector(`#caret_${parent_id}`);
                if (span) span.classList.remove('caret');
                ul_category.remove();
            } else {
                results.categories.forEach(category => {
                    ul_category.appendChild(
                        new Category_LI({
                            text:  category.category,
                            li_id: category.category_id,
                            ul_id: `category_${category.category_id}`,
                            append: new Button({
                                modal: 'category_view',
                                data: [{
                                    field: 'id',
                                    value: category.category_id
                                }],
                                small: true
                            }).e
                        }).e
                    );
                    getCategories(category.category_id);
                });
            };
            categories_loaded[categories_loaded.findIndex(e => e.id === parent_id)].status = true;
        });
    })
};
function viewCategory(category_id) {
    get({
        table: 'category',
        where: {category_id: category_id}
    })
    .then(function([category, options]) {
        set_innerText('category',           category.category);
        set_innerText('parent',             (category.parent ? category.parent.category : ''));
        set_innerText('createdAt_category', print_date(category.createdAt, true));
        set_innerText('updatedAt_category', print_date(category.updatedAt, true));
    });
};
addReloadListener(getCategories)
window.addEventListener('load', function () {
    modalOnShow('category_view', function (event) {viewCategory(event.relatedTarget.dataset.id)});
});