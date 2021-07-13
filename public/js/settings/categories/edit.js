function categoryEditBtn(category_id) {
    clear('category_edit')
    .then(span_edit => {
        span_edit.appendChild(
            new Link({
                modal: 'category_edit',
                type:  'edit',
                data:  {field: 'id', value: category_id}
            }).e
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
        query: [`category_id=${category_id}`]
    })
    .then(function([category, options]) {
        set_value({id: 'category_id_edit', value: category.category_id});
        set_value({id: '_category_edit',   value: category.category});
        listCategories({select: 'sel_category_edit', selected: category.parent_category_id || ''});
    });
};
addReloadListener(loadCategoriesEdit)
window.addEventListener('load', function () {
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
                    set_attribute({id: 'category_id_move', attribute: 'value', value: id});
                    remove_attribute({id: 'parent_category_id_move', attribute: 'value'});
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
                    set_attribute({id: 'parent_category_id_move', attribute: 'value', value: id});
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
});