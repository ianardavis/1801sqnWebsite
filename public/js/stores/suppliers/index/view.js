function getSuppliers() {
    Promise.all([
        clear('tbl_suppliers'),
        getElement('inp_supplier_name')
    ])
    .then(([tbl_suppliers, inp_supplier_name]) => {
        let like = {};
        if (inp_supplier_name.value.trim() != "") like.name = inp_supplier_name.value;

        get({
            table: 'suppliers',
            like:  like
        })
        .then(function ([result, options]) {
            result.suppliers.forEach(supplier => {
                tbl_suppliers.appendChild(new Card({
                    title:    supplier.name,
                    href:     `/suppliers/${supplier.supplier_id}`,
                    subtitle: {id: `default_${supplier.supplier_id}`},
                    body:     {data: {field: 'id', value: supplier.supplier_id}}
                }).e);
            });
            if (typeof getCounts  === 'function') getCounts();
            if (typeof getDefault === 'function') getDefault();
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSuppliers);
    addListener('inp_supplier_name', getSuppliers, 'input');
    addSortListeners('suppliers', getSuppliers);
    getSuppliers();
});