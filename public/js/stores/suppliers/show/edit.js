window.addEventListener("load", function () {
    $('#mdl_supplier_edit').on('show.bs.modal', function (event) {
        listAccounts()
        .then(result => {
            get(
                function (supplier, options) {
                    set_attribute({id: '_name_edit',      attribute: 'value', value: supplier._name});
                    set_attribute({id: '_address1_edit',  attribute: 'value', value: supplier._address1});
                    set_attribute({id: '_address2_edit',  attribute: 'value', value: supplier._address2});
                    set_attribute({id: '_address3_edit',  attribute: 'value', value: supplier._address3});
                    set_attribute({id: '_address4_edit',  attribute: 'value', value: supplier._address4});
                    set_attribute({id: '_address5_edit',  attribute: 'value', value: supplier._address5});
                    set_attribute({id: '_telephone_edit', attribute: 'value', value: supplier._telephone});
                    set_attribute({id: '_email_edit',     attribute: 'value', value: supplier._email});
                    if (supplier.account_id) {
                        set_value({id: 'sel_accounts',    value: supplier.account_id})
                    };
                    set_value({id: '_stores_edit',        value: supplier._stores});
                },
                {
                    table: 'supplier',
                    query: [`supplier_id=${path[3]}`],
                    spinner: 'supplier_edit'
                }
            );
        })
        .catch(err => console.log(err));
    });
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