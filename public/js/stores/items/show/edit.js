function viewItemEdit() {
    get({
        table:   'item',
        query:   [`item_id=${path[2]}`],
        spinner: 'item_edit'
    })
    .then(function ([item, options]) {
        set_value({id: 'description_edit', value: item.description});
        set_value({id: 'size_text_edit',   value: item.size_text});
        if (typeof listGenders === 'function') {
            listGenders({
                select:   'genders',
                selected: item.gender_id,
                blank:    true,
                id_only:  true
            });
        };
    });
};
window.addEventListener('load', function () {
    enable_button('item_edit');
    $('#mdl_item_edit').on('show.bs.modal', viewItemEdit);
    addFormListener(
        'item_edit',
        'PUT',
        `/items/${path[2]}`,
        {onComplete: [
            getItem,
            function () {$('#mdl_item_edit').modal('hide')}
        ]}
    );
});