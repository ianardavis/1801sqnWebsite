function getItem() {
    get({
        table: 'item',
        query: [`item_id=${path[2]}`]
    })
    .then(function ([item, options]) {
        set_breadcrumb({text: item.description});
        set_innerText({id: 'description', text: item.description});
        set_innerText({id: 'size_text',   text: item.size_text});
        set_innerText({id: 'gender',      text: (item.gender ? item.gender.gender : '')});
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id));
    });
};
addReloadListener(getItem);