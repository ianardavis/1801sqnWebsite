function CategoriesEdit() {
    document.querySelectorAll('.categories').forEach(e => {
        get(
            function(category, options) {
                e.appendChild(
                    new Link({
                        modal: 'category_edit',
                        small: true,
                        type: 'edit',
                        data:  {field: 'category_id', value: category.category_id}
                    }).e
                );
                e.removeAttribute('data-id');
                e.removeAttribute('class');
            },
            {
                table: 'category',
                query: [`category_id=${e.dataset.id}`]
            }
        );
    });
};
function loadCategoriesEdit() {
    let get_interval = window.setInterval(
        function () {
            if (categories_loaded.filter(e => e.status === false).length === 0) {
                console.log('cat done');
                configure_tree();
                CategoriesEdit();
                clearInterval(get_interval);
            };
        },
        200
    );
};
window.addEventListener('load', function () {
    addFormListener(
        'category_edit',
        'PUT',
        '/stores/categories',
        {
            onComplete: [
                getCategories,
                loadCategoriesEdit,
                function () {$('#mdl_category_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_category_edit').on('show.bs.modal', function (event) {
        get(
            function(category, options) {
                set_attribute({id: 'category_id_edit', attribute: 'value', value: category.category_id});
                set_value({id: '_category_edit', value: category._category});
            },
            {
                table: 'category',
                query: [`category_id=${event.relatedTarget.dataset.category_id}`]
            }
        );
    });
    document.querySelector('#reload').addEventListener('click', loadCategoriesEdit);
    let ul_category_ = document.querySelector('#ul_category_');
    if (ul_category_) {
        addFormListener(
            'category_move',
            'PUT',
            '/stores/categories',
            {
                noConfirm: true,
                onComplete: [
                    getCategories,
                    loadCategoriesEdit
                ]
            }
        )
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
                    document.querySelectorAll('.red').forEach(e => e.classList.remove('red'));
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