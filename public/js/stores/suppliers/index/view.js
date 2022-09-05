let inp_supplier_name = document.querySelector('#inp_supplier_name');
function getSuppliers() {
    clear('tbl_suppliers')
    .then(tbl_suppliers => {
        let like = {};
        if (inp_supplier_name.value.trim() != "") {
            like.name = inp_supplier_name.value
        }
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
addReloadListener(getSuppliers);
window.addEventListener('load', function () {
    inp_supplier_name.addEventListener('input', getSuppliers);
    add_sort_listeners('suppliers', getSuppliers);
    getSuppliers();
});