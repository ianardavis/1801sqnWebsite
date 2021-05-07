function categoryDeleteBtn(category_id) {
    let span_delete = document.querySelector('#category_delete');
    if (span_delete) {
        span_delete.innerHTML = '';
        span_delete.appendChild(
            new Delete_Button({
                descriptor: 'category',
                path: `/categories/${category_id}`,
                options: {
                    onComplete: [
                        getCategories,
                        function () {
                            if (typeof loadCategoriesEdit === 'function') loadCategoriesEdit();
                            modalHide('category_view');
                        }
                    ]
                }
            }).e
        );
    };
};
window.addEventListener('load', function () {
    modalOnShow('category_view', function (event) {categoryDeleteBtn(event.relatedTarget.dataset.id)});
});