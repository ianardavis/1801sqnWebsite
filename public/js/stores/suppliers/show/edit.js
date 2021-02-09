function viewSupplierEdit() {
    get(
        {
            table: 'supplier',
            query: [`supplier_id=${path[3]}`],
            spinner: 'supplier_edit'
        },
        function (supplier, options) {
            set_value({id: '_name_edit',      value: supplier._name});
            set_value({id: '_address1_edit',  value: supplier._address1});
            set_value({id: '_address2_edit',  value: supplier._address2});
            set_value({id: '_address3_edit',  value: supplier._address3});
            set_value({id: '_address4_edit',  value: supplier._address4});
            set_value({id: '_address5_edit',  value: supplier._address5});
            set_value({id: '_telephone_edit', value: supplier._telephone});
            set_value({id: '_email_edit',     value: supplier._email});
            set_value({id: '_stores_edit',    value: supplier._stores});
            listAccounts({selected: supplier.account_id});
        }
    );
};
window.addEventListener("load", function () {
    document.querySelector('#reload_accounts').addEventListener('click', listAccounts)
    remove_attribute({id: 'btn_supplier_edit', attribute: 'disabled'});
    $('#mdl_supplier_edit').on('show.bs.modal', viewSupplierEdit);
    addFormListener(
        'supplier_edit',
        'PUT',
        `/stores/suppliers/${path[3]}`,
        {onComplete: [
            getSupplier,
            function () {$('#mdl_supplier_edit').modal('hide')}
        ]}
    );
});