function getSupplier() {
    get(
        function (supplier, options) {
            set_innerText({id: '_name', text: supplier._name});
            set_innerText({id: '_address1',  text: supplier._address1});
            set_innerText({id: '_address2',  text: supplier._address2});
            set_innerText({id: '_address3',  text: supplier._address3});
            set_innerText({id: '_address4',  text: supplier._address4});
            set_innerText({id: '_address5',  text: supplier._address5});
            set_innerText({id: '_telephone', text: supplier._telephone});
            set_innerText({id: '_email',     text: supplier._email});
            if (supplier.account) {
                set_innerText({id: '_account',     text: supplier.account._name});
                set_attribute({id: 'account_link', attribute: 'href', value: `javascript:show("accounts",${supplier.account_id})`})
            };
            set_innerText({id: '_stores',    text: yesno(supplier._stores)});
            if (supplier.file) {
                set_innerText({id: '_file',     text: supplier.file._path});
                set_attribute({id: 'file_link', attribute: 'href', value: `javascript:show("files",${supplier.file_id})`});
            };
            set_breadcrumb({href: `/stores/suppliers/${supplier.supplier_id}`, text: supplier._name});
        
            let _edit = document.querySelector('#edit_link');
            if (_edit) _edit.href = `javascript:edit("suppliers",${supplier.supplier_id})`;
            
            getDefault();
            document.querySelectorAll('.supplier_id').forEach(e => e.value = supplier.supplier_id);
        },
        {
            table: 'supplier',
            query: [`supplier_id=${path[3]}`]
        }
    )
};
document.querySelector('#reload').addEventListener('click', getSupplier);