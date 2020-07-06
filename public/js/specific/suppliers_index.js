asCards = suppliers => {
    let _suppliers = document.querySelector('#suppliers');
    _suppliers.innerHTML = '';
    suppliers.forEach(supplier => {
        _suppliers.appendChild(new Card({
            href:   `/stores/suppliers/${supplier.supplier_id}`,
            id:     `supplier_${supplier.supplier_id}`,
            search: supplier._name,
            title:  supplier._name,
            body:   ''
        }).div);
    });
    getCounts();
    getSettings('default_supplier', setDefault, 'suppliers');
};
getCounts = () => {
    let cards = document.querySelectorAll('.search');
    cards.forEach(card => {
        let supplier_id = String(card.id).replace('supplier_', '');
        show_spinner('suppliers');
        const XHR = new XMLHttpRequest();
        XHR.addEventListener("load", event => {
            let response = JSON.parse(event.target.responseText);
            if (response.result) {
                let _body = document.querySelector(`#supplier_${supplier_id} .card-body p`);
                _body.innerText = `Items: ${response.count}`;
            } else alert(`Error: ${response.error}`);
            hide_spinner('suppliers');
        });
        XHR_send(XHR, 'suppliers', `/stores/count/sizes?supplier_id=${supplier_id}`);
    });
};
setDefault = results => {
    if (results.length === 1) {
        let card = document.querySelector(`#supplier_${results[0]._value} .card-header`);
        if (card) {
            let subtitle = document.createElement('p');
            subtitle.innerText = 'Default';
            subtitle.classList.add('card-subtitle', 'text-muted', 'f-10');
            card.appendChild(subtitle);
        };
    } else {
        alert(`Error: ${results.length} default suppliers found`);
    };
};