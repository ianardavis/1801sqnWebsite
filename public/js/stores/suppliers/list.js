listSuppliers = (suppliers, options) => {
    clearElement('sel_suppliers');
    let select = document.querySelector('#sel_suppliers');
    suppliers.forEach(supplier => {
        select.appendChild(new Option({
            value: `supplier_id=${supplier.supplier_id}`,
            text:  supplier._name
        }).e);
    });
    hide_spinner('suppliers');
};