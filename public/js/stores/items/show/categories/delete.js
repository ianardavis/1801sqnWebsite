function addCategoryDeleteBtn(event) {
    setAttribute('category_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    enableButton('category_delete');
    addFormListener(
        'category_delete',
        'DELETE',
        '/item_categories',
        {
            onComplete: [
                getCategories,
                function () {modalHide('category_view')}
            ]
        }
    );
    modalOnShow('category_view', addCategoryDeleteBtn);
});