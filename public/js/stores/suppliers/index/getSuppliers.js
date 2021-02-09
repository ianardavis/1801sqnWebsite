function getSuppliers() {
    let _suppliers = document.querySelector('#suppliers');
    if (_suppliers) {
        _suppliers.innerHTML = '';
        get(
            {
                table: 'suppliers',
                query: []
            },
            function (suppliers, options) {
                suppliers.forEach(supplier => {
                    let card       = document.createElement('div'),
                        a          = document.createElement('a'),
                        header     = document.createElement('div'),
                        title      = document.createElement('h3'),
                        body       = document.createElement('div'),
                        body_p     = document.createElement('p'),
                        span_items = document.createElement('span'),
                        subtitle   = document.createElement('p');
                    if (options.id) card.setAttribute('id', options.id);
                    card.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3');
                    a.setAttribute('href', `/stores/suppliers/${supplier.supplier_id}`);
                    a.classList.add('card', 'm-3', 'text-left');
                    header.classList.add('card-header');
                    title.classList.add('card-title');
                    title.classList.add('search');
                    title.innerText = supplier._name;
                    header.appendChild(title);
                    subtitle.classList.add('card-subtitle', 'text-muted', 'f-10');
                    subtitle.setAttribute('id', `default_${supplier.supplier_id}`)
                    header.appendChild(subtitle);
                    body.classList.add('card-body');
                    body_p.classList.add('text-left', 'f-10');
                    body_p.innerText = 'Items: ';
                    span_items.setAttribute('data-id', supplier.supplier_id);
                    span_items.classList.add('item-counts');
                    body_p.appendChild(span_items);
                    body.appendChild(body_p);
                    a.appendChild(header);
                    a.appendChild(body);
                    card.appendChild(a);
                    _suppliers.appendChild(card);
                });
                if (typeof getCounts  === 'function') getCounts();
                if (typeof getDefault === 'function') getDefault();
            }
        );
    };
};
document.querySelector('#reload').addEventListener('click', getSuppliers);