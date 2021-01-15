function listSuppliers() {
    get(
        function (suppliers, options) {
            let sel_suppliers = document.querySelector('#sel_suppliers');
            if (sel_suppliers) {
                sel_suppliers.innerHTML = '';
                sel_suppliers.appendChild(new Option().e);
                suppliers.forEach(supplier => {
                    sel_suppliers.appendChild(
                        new Option({
                            value: supplier.supplier_id,
                            text:  supplier._name,
                            selected: (options.selected === supplier.supplier_id)
                        }).e
                    )
                });
            };
        },
        {
            table: 'suppliers',
            query: []
        }
    )
};