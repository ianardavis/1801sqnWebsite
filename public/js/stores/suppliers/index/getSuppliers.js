function getSuppliers() {
    get(
        function (suppliers, options) {
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
            if (typeof getCounts  === 'function') getCounts();
            if (typeof getDefault === 'function') getDefault();
        },
        {
            table: 'suppliers',
            query: []
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSuppliers);