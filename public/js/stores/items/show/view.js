function get_item() {
    function disable_all_buttons() {
        disable_button('delete');
    };
    function display_details([item, options]) {
        set_breadcrumb(item.description);
        set_innerText('item_description', item.description);
        set_innerText('item_size_text1',  item.size_text1);
        set_innerText('item_size_text2',  item.size_text2);
        set_innerText('item_size_text3',  item.size_text3);
        set_innerText('item_gender',      (item.gender ? item.gender.gender : ''));
        set_innerText('size_text1_sizes_table', item.size_text1);
        set_innerText('size_text2_sizes_table', item.size_text2);
        set_innerText('size_text3_sizes_table', item.size_text3);
        return item;
    };
    function set_button_states(item) {
        if (typeof enable_edit_button   === 'function') enable_edit_button();
        if (typeof enable_delete_button === 'function') enable_delete_button();
        return item;
    };
    function set_item_id_values(item) {
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id));
        return item;
    };

    disable_all_buttons();
    get({
        table: 'item',
        where: {item_id: path[2]}
    })
    .then(display_details)
    .then(set_button_states)
    .then(set_item_id_values)
    .catch(err => redirect_on_error(err, '/items'));
};
window.addEventListener('load', function () {
    add_listener('reload', get_item);
    get_item();
});