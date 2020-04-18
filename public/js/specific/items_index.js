function getItems() {
    let spn_items = document.querySelector('#spn_items');
    spn_items.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#itemTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.items.forEach(item => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1);
                cell1.innerText = item._description;
                cell2.appendChild(link('/stores/items/' + item.item_id, false))
            });
        } else alert('Error: ' + response.error)
        spn_items.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting items'));
    let sel_category = document.querySelector('#sel_category'),
        sel_group    = document.querySelector('#sel_group'),
        sel_type     = document.querySelector('#sel_type'),
        sel_subtype  = document.querySelector('#sel_subtype'),
        sel_gender   = document.querySelector('#sel_gender'),
        query        = [];
    if (sel_category.value !== '') query.push('category_id=' + sel_category.value);
    if (sel_group.value !== '')    query.push('group_id=' +    sel_group.value);
    if (sel_type.value !== '')     query.push('type_id=' +     sel_type.value);
    if (sel_subtype.value !== '')  query.push('subtype_id=' +  sel_subtype.value);
    if (sel_gender.value !== '')   query.push('gender_id=' +   sel_gender.value);
    XHR.open('GET', '/stores/getitems?' + query.join('&'));
    XHR.send();
};