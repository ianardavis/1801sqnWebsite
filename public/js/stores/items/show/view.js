function getItem() {
    get({
        table: 'item',
        query: [`item_id=${path[2]}`]
    })
    .then(function ([item, options]) {
        set_breadcrumb({text: item.description});
        set_innerText({id: 'item_description', text: item.description});
        set_innerText({id: 'item_size_text',   text: item.size_text});
        set_innerText({id: 'item_gender',      text: (item.gender ? item.gender.gender : '')});
        set_innerText({id: 'size_text_sizes_table', text: item.size_text});
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id));
    })
    .catch(err => window.location.replace('/items'));
};
addReloadListener(getItem);