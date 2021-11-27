function getSuppliers() {
    clear('tbl_suppliers')
    .then(tbl_suppliers => {
        let sort_cols = tbl_suppliers.parentNode.querySelector('.sort') || null;
        get({
            table: 'suppliers',
            ...sort_query(sort_cols)
        })
        .then(function ([suppliers, options]) {
            suppliers.forEach(supplier => {
                tbl_suppliers.appendChild(new Card({
                    href:     `/suppliers/${supplier.supplier_id}`,
                    title:    supplier.name,
                    head_100: true,
                    search:   {title: true},
                    subtitle: {id: `default_${supplier.supplier_id}`},
                    body:     {data: {field: 'id', value: supplier.supplier_id}}
                }).e);
            });
            if (typeof getCounts  === 'function') getCounts();
            if (typeof getDefault === 'function') getDefault();
        });
    });
};
addReloadListener(getSuppliers);