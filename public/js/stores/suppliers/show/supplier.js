showSupplier = suppliers => {
    if (suppliers.length === 1) {
        for (let [id, value] of Object.entries(suppliers[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (id === 'account' && value) {
                    let _account = document.querySelector('#_account'),
                        account_link = document.querySelector('#account_link');
                    _account.innerText = value._number;
                    account_link.href = `javascript:show("accounts",${value.account_id})`;
                } else if (id === 'file' && value) {
                    let _file = document.querySelector('#_file'),
                        file_link = document.querySelector('#file_link');
                    _file.innerText = value._path;
                    file_link.href = `javascript:show("files",${value.file_id})`;
                } else if (id === '_stores') {
                    if (value === 0) element.innerText = 'No';
                    else if (value === 1) element.innerText = 'Yes';
                } else if (element) {
                    element.innerText = value;
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = suppliers[0]._name;
        breadcrumb.href = `/stores/suppliers/${suppliers[0].supplier_id}`;

        let _edit = document.querySelector('#edit_link');
        if (_edit) _edit.href = `javascript:edit("suppliers",${suppliers[0].supplier_id})`;

        getSettings('default_supplier', setDefault, 'suppliers');
        
        let supplier_ids = document.querySelectorAll('.supplier_id');
        supplier_ids.forEach(supplier_id => {
            supplier_id.value = suppliers[0].supplier_id;
        });


    } else alert(`${suppliers.length} matching suppliers found`);
};