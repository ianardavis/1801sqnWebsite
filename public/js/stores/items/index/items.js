function item_query() {
    let sel_category = document.querySelector('#sel_categories'),
        sel_group    = document.querySelector('#sel_groups'),
        sel_type     = document.querySelector('#sel_types'),
        sel_subtype  = document.querySelector('#sel_subtypes'),
        sel_gender   = document.querySelector('#sel_genders'),
        query        = [];
    if (sel_category.value !== '') query.push(`category_id=${sel_category.value}`);
    if (sel_group.value !== '')    query.push(`group_id=${sel_group.value}`);
    if (sel_type.value !== '')     query.push(`type_id=${sel_type.value}`);
    if (sel_subtype.value !== '')  query.push(`subtype_id=${sel_subtype.value}`);
    if (sel_gender.value !== '')   query.push(`gender_id=${sel_gender.value}`);
    return query;
};
function getItems() {
    get(
        function (items, options) {
            clearElement('tbl_items');
            let table_body = document.querySelector('#tbl_items');
            items.forEach(item => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    text: item._description,
                    classes: ['search']
                });
                add_cell(row, {append: new Link({
                    href: `/stores/items/${item.item_id}`,
                    small: true
                }).e});
            });
        },
        {
            table: 'items',
            query: item_query()
        }
    )
};
document.querySelector('#reload').addEventListener('click', () => getItems());