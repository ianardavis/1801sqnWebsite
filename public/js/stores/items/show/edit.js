function viewItemEdit() {
    get(
        {
            table:   'item',
            query:   [`item_id=${path[2]}`],
            spinner: 'item_edit'
        },
        function (item, options) {
            set_value({id: '_description_edit', value: item._description});
            set_value({id: '_size_text_edit',   value: item._size_text});
            listGenders({
                selected: item.gender_id,
                select:   'sel_gender_edit',
                blank:    true,
                id_only:   true
            });
        }
    );
};
window.addEventListener('load', function () {
    remove_attribute({id: 'btn_item_edit', attribute: 'disabled'});
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
    document.querySelector('#reload_item_edit').addEventListener('click', viewItemEdit);
});