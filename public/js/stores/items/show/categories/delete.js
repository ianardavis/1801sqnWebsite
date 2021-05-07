function addCategoryDeleteBtn(category_id) {
    let category_delete_btn = document.querySelector('#category_delete_btn');
    if (category_delete_btn) {
        category_delete_btn.innerHTML = '';
        get({
            table: 'item_category',
            query: [`item_category_id=${category_id}`]
        })
        .then(function ([category, options]) {
            category_delete_btn.appendChild(
                new Delete_Button({
                    path: `/item_categories/${category.item_category_id}`,
                    descriptor: 'category',
                    options: {
                        onComplete: [
                            getCategories,
                            function () {modalHide('category_view')}
                        ]
                    }
                }).e
            );
        });
    };
};
window.addEventListener('load', function () {
    modalOnShow('category_view', function (event) {addCategoryDeleteBtn(event.relatedTarget.dataset.id)});
});