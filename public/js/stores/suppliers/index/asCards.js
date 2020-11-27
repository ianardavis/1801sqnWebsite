asCards = suppliers => {
    clearElement('suppliers');
    let _suppliers = document.querySelector('#suppliers');
    suppliers.forEach(supplier => {
        _suppliers.appendChild(new Card({
            href:   `/stores/suppliers/${supplier.supplier_id}`,
            id:     `supplier_${supplier.supplier_id}`,
            title:  supplier._name,
            search_title: true,
            body:   ''
        }).e);
    });
    getCounts();
    getSettings('default_supplier', setDefault, 'suppliers');
};