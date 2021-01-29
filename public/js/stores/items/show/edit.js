window.addEventListener('load', function () {
    remove_attribute({id: 'btn_item_edit', attribute: 'disabled'});
    $('#mdl_item_edit').on('show.bs.modal', function() {
        get(
            function (item, options) {
                let _description_edit = document.querySelector('#_description_edit'),
                    _size_text_edit   = document.querySelector('#_size_text_edit'),
                    sel_genders       = document.querySelector('#sel_genders_edit');
                if (_description_edit) _description_edit.value = item._description;
                if (_size_text_edit)   _size_text_edit.value   = item._size_text;
                if (sel_genders) {
                    get(
                        function (genders, options) {
                            sel_genders.innerHTML= '';
                            sel_genders.appendChild(new Option({text: '', value: '', selected: (!item.gender_id)}).e);
                            genders.forEach(gender => {
                                sel_genders.appendChild(
                                    new Option({
                                        text:     gender._gender,
                                        value:    gender.gender_id,
                                        selected: (item.gender_id === gender.gendeer_id)
                                    }).e
                                )
                            });
                        },
                        {
                            table: 'genders',
                            query: []
                        }
                    );
                };
            },
            {
                table: 'item',
                query: [`item_id=${path[3]}`]
            }
        );
    });
    addFormListener(
        'form_item_edit',
        'PUT',
        `/stores/items/${path[3]}`,
        {onComplete: [
            getItem,
            function () {$('#mdl_item_edit').modal('hide')}
        ]}
    )
});