listSuppliers = (suppliers, options) => {
    let select = document.querySelector('#sel_suppliers');
    select.innerHTML = '';
    suppliers.forEach(supplier => {
        select.appendChild(new Option({
            value: supplier.supplier_id,
            text:  supplier._name
        }).e);
    });
    hide_spinner('suppliers');
};