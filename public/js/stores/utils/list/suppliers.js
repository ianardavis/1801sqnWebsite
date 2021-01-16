let suppliers_loaded = false;
function listSuppliers(options = {}) {
    suppliers_loaded = false;
    get(
        function (suppliers, options) {
            let sel_suppliers = document.querySelector('#sel_suppliers');
            if (sel_suppliers) {
                sel_suppliers.innerHTML = '';
                if (options.blank === true) sel_suppliers.appendChild(new Option(options.blank_opt || {}).e);
                suppliers.forEach(supplier => {
                    let value = '';
                    if (options.id_only) value = supplier.supplier_id
                    else                 value = `supplier_id=${supplier.supplier_id}`
                    sel_suppliers.appendChild(
                        new Option({
                            value: value,
                            text:  supplier._name,
                            selected: (options.selected === supplier.supplier_id)
                        }).e
                    )
                });
            };
            suppliers_loaded = true;
        },
        {
            table: 'suppliers',
            query: [],
            ...options
        }
    );
};