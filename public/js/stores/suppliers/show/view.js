function getSupplier() {
    get(
        {
            table: 'supplier',
            query: [`supplier_id=${path[2]}`]
        },
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
                set_innerText({id: '_account',      text: print_account(supplier.account)});
                set_attribute({id: '_account_link', attribute: 'data-id', value: supplier.account_id})
            };
            set_innerText({id: '_stores',    text: yesno(supplier._stores)});
            set_breadcrumb({href: `/stores/suppliers/${supplier.supplier_id}`, text: supplier._name});
            document.querySelectorAll('.supplier_id').forEach(e => e.value = supplier.supplier_id);
        }
    )
};
window.addEventListener("load", function () {
    document.querySelector('#reload').addEventListener('click', getSupplier);
});