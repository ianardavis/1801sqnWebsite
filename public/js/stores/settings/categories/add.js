window.addEventListener('load', function () {
    enable_button('category_add');
    addFormListener(
        'category_add',
        'POST',
        '/categories',
        {
            onComplete: [
                getCategories,
                loadCategoriesEdit,
                function () {$('#mdl_category_add').modal('hide')}
            ]
        }
    );
    $('#mdl_category_add').on('show.bs.modal', function (){listCategories({select: 'sel_category_add'})});
});