asCards = suppliers => {
    let _suppliers = document.querySelector('#suppliers');
    _suppliers.innerHTML = '';
    suppliers.forEach(supplier => {
        _suppliers.appendChild(new Card({
            href:   `/stores/suppliers/${supplier.supplier_id}`,
            id:     `supplier_${supplier.supplier_id}`,
            title:  supplier._name,
            search_title: true,
            body:   ''
        }).div);
    });
    getCounts();
    getSettings('default_supplier', setDefault, 'suppliers');
};