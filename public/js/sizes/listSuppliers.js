listSuppliers = (suppliers, options = {}) => {
    if (suppliers.length > 0) {
        let _select  = document.querySelector('#supplier_id');
        _select.innerHTML = '';
        _select.appendChild(new Option({value: '', text: ''}).option);
        suppliers.forEach(supplier => {
            _select.appendChild(
                new Option({
                    value: supplier.supplier_id,
                    text:  supplier._name,
                    selected: (options.selected === supplier.supplier_id)
                }).option
            )
        });
    } else alert('No suppliers found');
};