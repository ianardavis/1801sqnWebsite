window.addEventListener('load', function () {
    addFormListener(
        'category_add',
        'POST',
        '/stores/categories',
        {
            onComplete: [
                getCategories,
                loadCategoriesEdit,
                function () {$('#mdl_category_add').modal('hide')}
            ]
        }
    );
    $('#mdl_category_add').on('show.bs.modal', function () {
        get(
            function (categories, options) {
                let select = document.querySelector('#sel_category_add');
                if (select) {
                    select.innerHTML = '';
                    select.appendChild(new Option({text: ''}).e);
                    categories.forEach(category => {
                        select.appendChild(
                            new Option({
                                text: category._category,
                                value: category.category_id
                            }).e
                        );
                    });
                };
            },
            {
                table: 'categories',
                query: []
            }
        );
    });
});