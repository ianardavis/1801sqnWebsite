// let suppliers_loaded = false;
function listSuppliers(options = {}) {
    return new Promise((resolve, reject) => {
        // suppliers_loaded = false;
        clear(options.select || 'sel_suppliers')
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
                            value:    (options.id_only ? supplier.supplier_id : `"supplier_id":"${supplier.supplier_id}"`),
                            text:     supplier.name,
                            selected: (options.selected === supplier.supplier_id)
                        }).e
                    );
                });
                // suppliers_loaded = true;
                resolve(true);
            })
            .catch(err => {
                // suppliers_loaded = true;
                reject(err);
            });
        })
        .catch(err => {
            // suppliers_loaded = true;
            reject(err);
        });
    });
};