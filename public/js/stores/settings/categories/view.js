let categories_loaded = [];
function getCategories(parent_id = '') {
    categories_loaded.push({id: parent_id, status: false});
    let ul_category = document.querySelector(`#ul_category_${parent_id}`);
    if (ul_category) {
        ul_category.innerHTML = '';
        get(
            {
                table: 'categories',
                query: [`parent_category_id=${parent_id}`]
            },
            function (categories, options) {
                if (categories.length === 0) {
                    let span = document.querySelector(`#caret_${parent_id}`);
                    if (span) span.classList.remove('caret');
                    ul_category.remove();
                } else {
                    categories.forEach(category => {
                        ul_category.appendChild(
                            new Category_LI({
                                text:  `${category._category} (${category.category_id})`,
                                li_id: category.category_id,
                                ul_id: `category_${category.category_id}`,
                                append: new Link({
                                    modal: 'category_view',
                                    data: {
                                        field: 'id',
                                        value: category.category_id
                                    },
                                    small: true
                                }).e
                            }).e
                        );
                        getCategories(category.category_id);
                    });
                };
                categories_loaded[categories_loaded.findIndex(e => e.id === parent_id)].status = true;
            }
        );
    };
};
function viewCategory(category_id) {
    get(
        {
            table: 'category',
            query: [`category_id=${category_id}`]
        },
        function(category, options) {
            set_innerText({id: '_category',          text: category._category});
            if (category.parent) set_innerText({id: '_parent', text: category.parent._category})
            else                 set_innerText({id: '_parent', text: ''});
            set_innerText({id: 'user_category',      text: print_user(category.user)});
            set_innerText({id: 'createdAt_category', text: print_date(category.createdAt, true)});
            set_innerText({id: 'updatedAt_category', text: print_date(category.updatedAt, true)});
        }
    );
};
window.addEventListener('load', function () {
    modalOnShow('category_view', function (event) {viewCategory(event.relatedTarget.dataset.id)});
    document.querySelector('#reload').addEventListener('click', function () {getCategories()});
});