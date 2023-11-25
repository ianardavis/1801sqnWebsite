window.addEventListener('load', function () {
    enableButton('category_add');
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