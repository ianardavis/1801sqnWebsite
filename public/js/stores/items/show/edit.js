function viewItemEdit() {
    get({
        table:   'item',
        query:   [`item_id=${path[2]}`],
        spinner: 'item_edit'
    })
    .then(function ([item, options]) {
        set_value({id: 'description_edit', value: item.description});
        set_value({id: 'size_text1_edit',   value: item.size_text1});
        set_value({id: 'size_text2_edit',   value: item.size_text2});
        set_value({id: 'size_text3_edit',   value: item.size_text3});
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