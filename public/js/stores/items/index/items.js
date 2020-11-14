showItems = (items, options) => {
    let table_body = document.querySelector('#itemTable');
    table_body.innerHTML = '';
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
    hide_spinner('items');
};
item_query = () => {
    let category = document.querySelector('#categoriesSelect'),
        group    = document.querySelector('#groupsSelect'),
        type     = document.querySelector('#typesSelect'),
        subtype  = document.querySelector('#subtypesSelect'),
        gender   = document.querySelector('#gendersSelect'),
        query        = [];
    if (category.value !== '') query.push('category_id=' + category.value);
    if (group.value !== '')    query.push('group_id=' +    group.value);
    if (type.value !== '')     query.push('type_id=' +     type.value);
    if (subtype.value !== '')  query.push('subtype_id=' +  subtype.value);
    if (gender.value !== '')   query.push('gender_id=' +   gender.value);
    return query;
};