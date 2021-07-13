function categoryDeleteBtn(category_id) {
    clear('category_delete')
    .then(span_delete => {
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
    })
};
window.addEventListener('load', function () {
    modalOnShow('category_view', function (event) {categoryDeleteBtn(event.relatedTarget.dataset.id)});
});