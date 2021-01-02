let suppliers_loaded = false;
function getSuppliers(query = []) {
    suppliers_loaded = false;
    let select = document.querySelector('#sel_suppliers');
    if (select) {
        select.innerHTML = '';
        get(
            function (suppliers, options) {
                suppliers.forEach(e => {
                    select.appendChild(
                        new Option({
                            value: `supplier_id=${e.supplier_id}`,
                            text:  e._name
                        }).e
                    );
                });
                suppliers_loaded = true;
            },
            {
                table: 'suppliers',
                query: query
            }
        );
    };
};
document.querySelector('#reload_suppliers').addEventListener('click', function () {getSuppliers()});