function listSuppliers(options = {}) {
    return new Promise((resolve, reject) => {
        clear_select(options.select || 'suppliers')
        .then(sel_suppliers => {
            get({
                table: 'suppliers',
                ...options
            })
            .then(function ([suppliers, options]) {
                if (options.blank === true) sel_suppliers.appendChild(new Option({text: options.blank_text || ''}).e);
                suppliers.forEach(supplier => {
                    sel_suppliers.appendChild(
                        new Option({
                            value:    (options.id_only ? supplier.supplier_id : `supplier_id=${supplier.supplier_id}`),
                            text:     supplier.name,
                            selected: (options.selected === supplier.supplier_id)
                        }).e
                    );
                });
                resolve(true);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};