function getSuppliers(query = []) {
    get(
        function (suppliers, options) {
            let select = document.querySelector('#sel_suppliers');
            if (select) {
                select.innerHTML = '';
                suppliers.forEach(supplier => {
                    select.appendChild(
                        new Option({
                            value: `supplier_id=${supplier.supplier_id}`,
                            text:  supplier._name
                        }).e
                    );
                });
            };
        },
        {
            table: 'suppliers',
            query: query
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSuppliers);