function viewSizeEdit() {
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

window.addEventListener('load', function () {
    remove_attribute({id: 'btn_size_edit', attribute: 'disabled'});
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
    $('#mdl_size_edit').on('show.bs.modal', viewSizeEdit);
    document.querySelector('#reload_suppliers').addEventListener('click', function () {
        listSuppliers({
            blank:   true,
            id_only: true,
            select:  'supplier_id_edit'
        });
    });
});