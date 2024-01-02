const enable_edit_button = function () {enableButton('item_edit')};
function view_item_edit() {
    function display_details ([item, options]) {
        setValue('description_edit', item.description);
        setValue('size_text1_edit',  item.size_text1);
        setValue('size_text2_edit',  item.size_text2);
        setValue('size_text3_edit',  item.size_text3);
        return item;
    };
    get({
        table: 'item',
        where: {item_id: path[2]}
    })
    .then(display_details);
};
window.addEventListener('load', function () {
    modalOnShow('item_edit', get_size_descriptions);
    modalOnShow('item_edit', view_item_edit);
    addFormListener(
        'item_edit',
        'PUT',
        `/items/${path[2]}`,
        {onComplete: [
            get_item,
            function () {modalHide('item_edit')}
        ]}
    );
});