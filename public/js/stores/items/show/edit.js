function getItemEdit() {
    get(
        {
            table:   'item',
            query:   [`item_id=${path[3]}`],
            spinner: 'item_edit'
        },
        function (item, options) {
            let _description_edit = document.querySelector('#_description_edit'),
                _size_text_edit   = document.querySelector('#_size_text_edit'),
                sel_genders       = document.querySelector('#sel_genders_edit');
            if (_description_edit) _description_edit.value = item._description;
            if (_size_text_edit)   _size_text_edit.value   = item._size_text;
            if (sel_genders) {
                sel_genders.innerHTML= '';
                get(
                    {
                        table: 'genders',
                        query: []
                    },
                    function (genders, options) {
                        sel_genders.appendChild(new Option({text: '', value: '', selected: (!item.gender_id)}).e);
                        genders.forEach(gender => {
                            sel_genders.appendChild(
                                new Option({
                                    text:     gender._gender,
                                    value:    gender.gender_id,
                                    selected: (item.gender_id === gender.gender_id)
                                }).e
                            )
                        });
                    }
                );
            };
        }
    );
};
function categoryDelete() {
    document.querySelectorAll('.categories').forEach(e => {
        get(
            {
                table: 'item_category',
                query: [`item_category_id=${e.dataset.id}`]
            },
            function(item_category, options) {
                e.appendChild(
                    new Delete_Button({
                        descriptor: 'category',
                        path:       `/stores/item_categories/${item_category.item_category_id}`,
                        small:      true,
                        options:    {onComplete: [
                            getCategories,
                            loadCategoryDelete
                        ]}
                    }).e
                );
                e.removeAttribute('data-id');
                e.removeAttribute('class');
            }
        );
    });
};
function loadCategoryDelete() {
    let get_interval = window.setInterval(
        function () {
            if (categories_loaded === true) {
                categoryDelete();
                clearInterval(get_interval);
            };
        },
        200
    );
};
function listCategories(select, parent_id = '') {
    let sel_category = document.querySelector(`#sel_category_${select}`);
    if (sel_category) {
        sel_category.innerHTML = '';
        get(
            {
                table: 'categories',
                query: [`parent_category_id=${parent_id}`]
            },
            function (categories, options) {
                if (categories.length === 0) {
                    sel_category.remove();
                } else {
                    sel_category.appendChild(new Option({text: '... Select Category', selected: true}).e);
                    categories.forEach(category => {
                        sel_category.appendChild(
                            new Option({
                                text:  category._category,
                                value: category.category_id
                            }).e
                        )
                    });
                };
            }
        );
    };
};
function addCategorySelect() {
    let select         = document.querySelectorAll('.sel_category').length + 1 || 1,
        sub_categories = document.querySelector('#sub_categories');
    if (sub_categories) {
        sub_categories.appendChild(
            new Select({
                attributes: [
                    {field: 'id',   value: `sel_category_${select}`},
                    {field: 'name', value: 'category[category_id][]'}
                ],
                classes: ['form-control', 'sel_category'],
                listener: {event: 'change', func: function () {addCategory(this)}}
            }).e
        );
        return select
    } else return null;
};
function addCategory(parent_select) {
    let parent_num = Number(parent_select.id.replace('sel_category_', '')),
        child_sel  = document.querySelector(`#sel_category_${parent_num + 1}`);
    if (child_sel) {
        listCategories(parent_num + 1, parent_select.value);
    } else {
        let select = addCategorySelect();
        listCategories(select, parent_select.value);
    };
};
function reset_categories_add() {
    let sub_categories = document.querySelector('#sub_categories');
    if (sub_categories) sub_categories.innerHTML = '';
    listCategories('1');
};
window.addEventListener('load', function () {
    remove_attribute({id: 'btn_item_edit', attribute: 'disabled'});
    $('#mdl_item_edit').on('show.bs.modal', getItemEdit);
    addFormListener(
        'item_edit',
        'PUT',
        `/stores/items/${path[3]}`,
        {onComplete: [
            getItem,
            function () {$('#mdl_item_edit').modal('hide')}
        ]}
    );
    addFormListener(
        'category_add',
        'POST',
        '/stores/item_categories',
        {onComplete: [
            getCategories,
            loadCategoryDelete,
            reset_categories_add
        ]}
    );
    listCategories('1');
    document.querySelector('#reload_item_edit').addEventListener('click', getItemEdit);
    document.querySelector('#sel_category_1')  .addEventListener('change', function () {
        let sub_categories = document.querySelector('#sub_categories');
        if (sub_categories) {
            sub_categories.innerHTML = '';
            if (this.value !== '') {
                addCategory(this);
            };
        };
    });
    document.querySelector('#reload').addEventListener('click', loadCategoryDelete);
});