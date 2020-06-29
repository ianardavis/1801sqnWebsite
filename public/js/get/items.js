getItems = () => {
    show_spinner('items');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#itemTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.items.forEach(item => {
                let row = table_body.insertRow(-1);
                add_cell(row, {text: item._description});
                add_cell(row, {append: link('/stores/items/' + item.item_id, false)});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('items');
    });
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
    XHR_send(XHR, 'items', '/stores/get/items?' + query.join('&'));
};