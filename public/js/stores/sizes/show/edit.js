function getSizeEdit() {
    get(
        {
            table: 'size',
            query: [`size_id=${path[3]}`]
        },
        function (size, options) {
            listSuppliers({
                blank:    true,
                id_only:  true,
                select:   'supplier_id_edit',
                selected: size.supplier_id
            });
            set_value({id: '_issueable_edit', value: size._issueable});
            set_value({id: '_orderable_edit', value: size._orderable});
            set_value({id: '_serials_edit',   value: size._serials});
            set_value({id: '_nsns_edit',      value: size._nsns});
            set_value({id: '_size_edit',      value: size._size});
        }
    );
};
function detailDelete() {
    document.querySelectorAll('.details').forEach(e => {
        get(
            {
                table: 'detail',
                query: [`detail_id=${e.dataset.id}`]
            },
            function(detail, options) {
                e.appendChild(
                    new Delete_Button({
                        descriptor: 'detail',
                        path:       `/stores/details/${detail.detail_id}`,
                        small:      true,
                        options:    {onComplete: [
                            getDetails,
                            loadDetailDelete
                        ]}
                    }).e
                );
                e.removeAttribute('data-id');
                e.removeAttribute('class');
            }
        );
    });
};
function loadDetailDelete() {
    let get_interval = window.setInterval(
        function () {
            if (details_loaded === true) {
                detailDelete();
                clearInterval(get_interval);
            };
        },
        200
    );
};
function getDetailOptions() {
    get(
        {
            table: 'settings',
            query: ['_name=detail_option']
        },
        function (settings, options) {
            let list = document.querySelector('#list_detail_options');
            if (list) {
                list.innerHTML = '';
                settings.forEach(setting => {
                    list.appendChild(
                        new Option({value: setting._value}).e
                    );
                });
            };
        }
    );
};
window.addEventListener('load', function () {
    getDetailOptions();
    remove_attribute({id: 'btn_size_edit', attribute: 'disabled'});
    addFormListener(
        'detail_add',
        'POST',
        '/stores/details',
        {
            onComplete: [
                getDetails,
                loadDetailDelete,
                function () {
                    set_value({id: 'inp_detail_name',  value: ''});
                    set_value({id: 'inp_detail_value', value: ''});
                }
            ]
        }
    );
    addFormListener(
        'size_edit',
        'PUT',
        `/stores/sizes/${path[3]}`,
        {
            onComplete: [
                getSize,
                function () {$('#mdl_size_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_size_edit').on('show.bs.modal', getSizeEdit);
    document.querySelector('#reload_suppliers').addEventListener('click', function () {
        listSuppliers({
            blank:   true,
            id_only: true,
            select:  'supplier_id_edit'
        });
    });
    document.querySelector('#reload').addEventListener('click', loadDetailDelete);
});