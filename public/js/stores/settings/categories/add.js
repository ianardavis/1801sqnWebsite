window.addEventListener('load', function () {
    remove_attribute({id: 'btn_category_add', attribute: 'disabled'});
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
    $('#mdl_category_add').on('show.bs.modal', function (){listCategories({select: 'sel_category_add'})});
});