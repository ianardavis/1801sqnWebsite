function categoryEditBtn(category_id) {
    clear('category_edit')
    .then(span_edit => {
        span_edit.appendChild(
            new Modal_Button(
                _edit(),
                'category_edit',
                [{field: 'id', value: category_id}],
                false
            ).e
        );
    });
};
function loadCategoriesEdit() {
    let get_interval = window.setInterval(
        function () {
            if (categories_loaded.filter(e => e.status === false).length === 0) {
                configure_tree();
                clearInterval(get_interval);
            };
        },
        200
    );
};
function viewCategoryEdit(category_id) {
    modalHide('category_view');
    get({
        table: 'category',
        where: {category_id: category_id}
    })
    .then(function([category, options]) {
        setValue('category_id_edit', category.category_id);
        setValue('_category_edit',   category.category);
        listCategories({select: 'sel_category_edit', selected: category.parent_category_id || ''});
    });
};
window.addEventListener('load', function () {
    addListener('reload', loadCategoriesEdit);
    modalOnShow('category_view', function (event) {categoryEditBtn(event.relatedTarget.dataset.id)});
    modalOnShow('category_edit', function (event) {viewCategoryEdit(event.relatedTarget.dataset.id)});
    addFormListener(
        'category_edit',
        'PUT',
        '/categories',
        {
            onComplete: [
                getCategories,
                loadCategoriesEdit,
                function () {modalHide('category_edit')}
            ]
        }
    );
    let ul_category_ = document.querySelector('#ul_category_');
    if (ul_category_) {
        addFormListener(
            'category_move',
            'PUT',
            '/categories',
            {
                noConfirm: true,
                noConfirmAlert: true,
                onComplete: [
                    getCategories,
                    loadCategoriesEdit
                ]
            }
        );
        ul_category_.addEventListener('mousedown', function (event) {
            let id = document.elementFromPoint(event.pageX, event.clientY).dataset.id;
            if (id) {
                let ele = document.querySelector(`.list-group-item [data-id="${id}"]`);
                if (ele) {
                    setAttribute('category_id_move', 'value', id);
                    setAttribute('parent_category_id_move', 'value');
                    ele.classList.add('green');
                    dragging = true;
                };
            };
        });
        ul_category_.addEventListener('mouseup', function (event) {
            let id = document.elementFromPoint(event.pageX, event.clientY).dataset.id;
            if (id) {
                let ele = document.querySelector(`.list-group-item [data-id="${id}"]`);
                if (ele) {
                    setAttribute('parent_category_id_move', 'value', id);
                    document.querySelectorAll('.green').forEach(e => e.classList.remove('green'));
                    document.querySelectorAll('.red')  .forEach(e => e.classList.remove('red'));
                    dragging = false;
                    let category_id        = document.querySelector('#category_id_move'),
                        parent_category_id = document.querySelector('#parent_category_id_move');
                    if (
                        category_id && category_id.value !== '' &&
                        parent_category_id && parent_category_id.value !== '' &&
                        category_id.value !== parent_category_id.value
                    ) {
                        let form = document.querySelector('#form_category_move');
                        if (form) form.requestSubmit();
                    };
                };
            };
        });
    };
    loadCategoriesEdit();
});