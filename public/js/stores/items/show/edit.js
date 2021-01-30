function getItemEdit() {
    get(
        function (item, options) {
            let _description_edit = document.querySelector('#_description_edit'),
                _size_text_edit   = document.querySelector('#_size_text_edit'),
                sel_genders       = document.querySelector('#sel_genders_edit');
            if (_description_edit) _description_edit.value = item._description;
            if (_size_text_edit)   _size_text_edit.value   = item._size_text;
            if (sel_genders) {
                sel_genders.innerHTML= '';
                get(
                    function (genders, options) {
                        sel_genders.appendChild(new Option({text: '', value: '', selected: (!item.gender_id)}).e);
                        genders.forEach(gender => {
                            sel_genders.appendChild(
                                new Option({
                                    text:     gender._gender,
                                    value:    gender.gender_id,
                                    selected: (item.gender_id === gender.gender_id)
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
            table:   'item',
            query:   [`item_id=${path[3]}`],
            spinner: 'item_edit'
        }
    );
};
function categoryDelete() {
    document.querySelectorAll('.categories').forEach(e => {
        get(
            function(item_category, options) {
                e.appendChild(
                    new Delete_Button({
                        descriptor: 'category',
                        path:       `/stores/item_categories/${item_category.item_category_id}`,
                        small:      true,
                        options:    {onComplete: [
                            getCategories,
                            loadCategoryDelete
                        ]}
                    }).e
                );
                e.removeAttribute('data-id');
                e.removeAttribute('class');
            },
            {
                table: 'item_category',
                query: [`item_category_id=${e.dataset.id}`]
            }
        );
    });
};
function loadCategoryDelete () {
    let get_interval = window.setInterval(
        function () {
            if (categories_loaded === true) {
                categoryDelete();
                clearInterval(get_interval);
            };
        },
        200
    );
};
window.addEventListener('load', function () {
    remove_attribute({id: 'btn_item_edit', attribute: 'disabled'});
    $('#mdl_item_edit').on('show.bs.modal', getItemEdit);
    addFormListener(
        'form_item_edit',
        'PUT',
        `/stores/items/${path[3]}`,
        {onComplete: [
            getItem,
            function () {$('#mdl_item_edit').modal('hide')}
        ]}
    );
    document.querySelector('#reload_item_edit').addEventListener('click', getItemEdit);
});