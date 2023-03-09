function getItem() {
    get({
        table: 'item',
        where: {item_id: path[2]}
    })
    .then(function ([item, options]) {
        set_breadcrumb(item.description);
        set_innerText('item_description', item.description);
        set_innerText('item_size_text1',  item.size_text1);
        set_innerText('item_size_text2',  item.size_text2);
        set_innerText('item_size_text3',  item.size_text3);
        set_innerText('item_gender',      (item.gender ? item.gender.gender : ''));
        set_innerText('size_text1_sizes_table', item.size_text1);
        set_innerText('size_text2_sizes_table', item.size_text2);
        set_innerText('size_text3_sizes_table', item.size_text3);
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id));
    })
    .catch(err => window.location.assign('/items'));
};
window.addEventListener('load', function () {
    add_listener('reload', getItem);
});