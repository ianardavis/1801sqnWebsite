window.addEventListener('load', function () {
    $('#mdl_category_view').on('show.bs.modal', function (event) {
        let span_delete = document.querySelector('#category_delete');
        if (span_delete) {
            span_delete.innerHTML = '';
            span_delete.appendChild(
                new Delete_Button({
                    descriptor: 'category',
                    path: `/stores/categories/${event.relatedTarget.dataset.id}`,
                    options: {
                        onComplete: [
                            getCategories,
                            function () {
                                if (typeof loadCategoriesEdit === 'function') loadCategoriesEdit();
                                $('#mdl_category_view').modal('hide')
                            }
                        ]
                    }
                }).e
            );
        };
    });
});