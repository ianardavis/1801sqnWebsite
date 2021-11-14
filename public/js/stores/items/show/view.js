function getItem() {
    get({
        table: 'item',
        query: [`"item_id":"${path[2]}"`]
    })
    .then(function ([item, options]) {
        set_breadcrumb({text: item.description});
        set_innerText({id: 'item_description',       text: item.description});
        set_innerText({id: 'item_size_text1',        text: item.size_text1});
        set_innerHTML({id: 'size_text1_sizes_table', text: `${item.size_text1 || ''}<span class='sort_ind float-end'></span>`});
        set_innerText({id: 'item_size_text2',        text: item.size_text2});
        set_innerHTML({id: 'size_text2_sizes_table', text: `${item.size_text2 || ''}<span class='sort_ind float-end'></span>`});
        set_innerText({id: 'item_size_text3',        text: item.size_text3});
        set_innerHTML({id: 'size_text3_sizes_table', text: `${item.size_text3 || ''}<span class='sort_ind float-end'></span>`});
        set_innerText({id: 'item_gender',            text: (item.gender ? item.gender.gender : '')});
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id));
    })
    .catch(err => window.location.assign('/items'));
};
addReloadListener(getItem);