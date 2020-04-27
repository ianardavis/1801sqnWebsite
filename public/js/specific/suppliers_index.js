function getSuppliers(_default) {
    let spn_suppliers = document.querySelector('#spn_suppliers');
    spn_suppliers.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            supplier_container = document.querySelector('#suppliers');
        supplier_container.innerHTML = '';
        if (response.result) {
            response.suppliers.forEach(supplier => {
                let _div     = document.createElement('div'),
                    card     = document.createElement('div'),
                    _a       = document.createElement('a'),
                    header   = document.createElement('div'),
                    title    = document.createElement('h3'),
                    body     = document.createElement('div'),
                    body_p   = document.createElement('p');
                _div.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3')
                card.classList.add('card', 'm-3', 'text-left');
                _a.href = '/stores/suppliers/' + supplier.supplier_id;
                header.classList.add('card-header');
                title.classList.add('card-title');
                title.innerText = supplier._name;
                body.classList.add('card-body');
                body_p.classList.add('f-10');
                body_p.innerText = 'Items: ' + supplier.sizes.length;
                header.appendChild(title);
                if (Number(_default) === Number(supplier.supplier_id)) {
                    let subTitle = document.createElement('p');
                    subTitle.classList.add('card-subtitle', 'text-muted', 'f-10');
                    subTitle.innerText = 'Default';
                    header.appendChild(subTitle);
                };
                body.appendChild(body_p);
                _a.appendChild(header);
                _a.appendChild(body);
                card.appendChild(_a);
                _div.appendChild(card);
                supplier_container.appendChild(_div);
            });
        } else alert('Error: ' + response.error)
        spn_suppliers.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting suppliers'));
    XHR.open('GET', '/stores/getsuppliers');
    XHR.send();
};