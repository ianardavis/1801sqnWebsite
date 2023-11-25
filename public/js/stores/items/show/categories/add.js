function reset_categories_add() {
    let sub_categories = document.querySelector('#sub_categories');
    if (sub_categories) sub_categories.innerHTML = '';
    listCategories('1');
};
function listCategories(select, parent_id = null) {
    clear(`sel_category_${select}`)
    .then(sel_category => {
        get({
            table: 'categories',
            where: {category_id_parent: parent_id}
        })
        .then(function ([result, options]) {
            if (result.count === 0) sel_category.remove();
            else {
                sel_category.appendChild(new Option({text: '... Select Category', selected: true}).e);
                result.categories.forEach(category => {
                    sel_category.appendChild(
                        new Option({
                            text:  category.category,
                            value: category.category_id
                        }).e
                    )
                });
            };
        })
        .catch(err => console.error(err));
    });
};
function addCategorySelect() {
    let select         = document.querySelectorAll('.sel_category').length + 1 || 1,
        sub_categories = document.querySelector('#sub_categories');
    if (sub_categories) {
        sub_categories.appendChild(
            new Select({
                large: true,
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
window.addEventListener('load', function () {
    enableButton('category_add');
    addFormListener(
        'category_add',
        'POST',
        '/item_categories',
        {onComplete: [
            get_categories,
            reset_categories_add
        ]}
    );
    modalOnShow('category_add', function () {listCategories('1')});
    add_listener('sel_category_1', function () {
        let sub_categories = document.querySelector('#sub_categories');
        if (sub_categories) {
            sub_categories.innerHTML = '';
            if (this.value !== '') {
                addCategory(this);
            };
        };
    }, 'change')
});