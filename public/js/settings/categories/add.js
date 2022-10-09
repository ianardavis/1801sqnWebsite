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
                function () {modalHide('category_add')}
            ]
        }
    );
    modalOnShow('category_add', function (){listCategories({select: 'sel_category_add'})});
});