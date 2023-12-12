function categoryDeleteBtn(event) {
    setAttribute('category_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    enableButton('category_delete');
    addFormListener(
        'category_delete',
        'DELETE',
        '/categories',
        {
            onComplete: [
                getCategories,
                function () {
                    if (typeof loadCategoriesEdit === 'function') loadCategoriesEdit();
                    modalHide('category_view');
                }
            ]
        }
    );
    modalOnShow('category_view', categoryDeleteBtn);
});