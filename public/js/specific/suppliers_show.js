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
                    file_link.href = `javascript:edit("files",${value.file_id})`;
                } else if (id === '_stores') {
                    if (value === 0) element.innerText = 'No';
                    else if (value === 1) element.innerText = 'Yes';
                } else if (element) {
                    element.innerText = value;
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#supplier_breadcrumb');
        breadcrumb.innerText = suppliers[0]._name;
        breadcrumb.href = `/stores/suppliers/${suppliers[0].supplier_id}`;

        let _edit = document.querySelector('#edit_link');
        if (_edit) _edit.href = `javascript:edit("suppliers",${suppliers[0].supplier_id})`;

        let supplier_ids = document.querySelectorAll('.supplier_id');
        supplier_ids.forEach(supplier_id => {
            supplier_id.value = suppliers[0].supplier_id;
        });

        ['demandsCompleteSelect', 'demandsClosedSelect'].forEach(id => {
            let select = document.querySelector('#' + id);
            if (select) select.addEventListener('change', () => getDemands(["supplier_id=" + suppliers[0].supplier_id]));
        });

        let receiptselect = document.querySelector('#receiptsCompleteSelect');
        if (receiptselect) receiptselect.addEventListener('change', () => getReceipts(["supplier_id=" + suppliers[0].supplier_id]));

        getSettings('default_supplier', setDefault, 'suppliers');

        let default_supplier_id = document.querySelector('#default_supplier_id');
        default_supplier_id.value = suppliers[0].supplier_id;

    } else alert(`${suppliers.length} matching suppliers found`);
};
setDefault = results => {
    if (results.length === 1) {
        let _default = document.querySelector('#_default');
        if (_default) {
            let _button = document.querySelector('#default_button');
            if (results[0]._value === path[3]) {
                _button.setAttribute('disabled', true);
                _default.innerText = 'Yes';
            } else {
                _button.removeAttribute('disabled');
                _default.innerText = 'No';
            };
        };
    } else {
        alert(`Error: ${results.length} default suppliers found`);
    };
};