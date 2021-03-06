function reset_categories_add() {
    let sub_categories = document.querySelector('#sub_categories');
    if (sub_categories) sub_categories.innerHTML = '';
    listCategories('1');
};
function listCategories(select, parent_id = '') {
    clear(`sel_category_${select}`)
    .then(sel_category => {
        get({
            table: 'categories',
            query: [`category_id_parent=${parent_id}`]
        })
        .then(function ([categories, options]) {
            if (categories.length === 0) sel_category.remove();
            else {
                sel_category.appendChild(new Option({text: '... Select Category', selected: true}).e);
                categories.forEach(category => {
                    sel_category.appendChild(
                        new Option({
                            text:  category.category,
                            value: category.category_id
                        }).e
                    )
                });
            };
        })
        .catch(err => console.log(err));
    });
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
window.addEventListener('load', function () {
    enable_button('category_add');
    addFormListener(
        'category_add',
        'POST',
        '/item_categories',
        {onComplete: [
            getCategories,
            reset_categories_add
        ]}
    );
    listCategories('1');
    addListener('sel_category_1', function () {
        let sub_categories = document.querySelector('#sub_categories');
        if (sub_categories) {
            sub_categories.innerHTML = '';
            if (this.value !== '') {
                addCategory(this);
            };
        };
    }, 'change')
});