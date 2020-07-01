getSuppliers = () => {
    show_spinner('suppliers');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText),
            _select  = document.querySelector('#suppliersSelect');
        _select.innerHTML = '';
        if (response.result) {
            _select.appendChild(_option({value: -1, text: 'All'}));
            response.suppliers.forEach(supplier => _select.appendChild(_option({value: supplier.supplier_id, text: supplier._name, selected: (supplier.supplier_id === 1)})));
        } else alert('Error: ' + response.error);
        hide_spinner('suppliers');
    });
    XHR_send(XHR, 'suppliers', '/stores/get/suppliers');
};