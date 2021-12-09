function viewItemEdit() {
    get({
        table:   'item',
        query:   [`"item_id":"${path[2]}"`],
        spinner: 'item_edit'
    })
    .then(function ([item, options]) {
        set_value('description_edit', item.description);
        set_value('size_text1_edit',  item.size_text1);
        set_value('size_text2_edit',  item.size_text2);
        set_value('size_text3_edit',  item.size_text3);
        if (typeof listGenders === 'function') {
            listGenders({
                select:   'sel_genders',
                selected: item.gender_id,
                blank:    true,
                id_only:  true
            });
        };
    });
};
window.addEventListener('load', function () {
    modalOnShow('item_edit', get_size_descriptions);
    enable_button('item_edit');
    modalOnShow('item_edit', viewItemEdit);
    addFormListener(
        'item_edit',
        'PUT',
        `/items/${path[2]}`,
        {onComplete: [
            getItem,
            function () {modalHide('item_edit')}
        ]}
    );
});