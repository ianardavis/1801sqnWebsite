function getSuppliers() {
    get(
        function (suppliers, options) {
            let sel_suppliers = document.querySelector('#supplier_id');
            if (sel_suppliers) {
                sel_suppliers.innerHTML = '';
                sel_suppliers.appendChild(new Option({value: '', text: '', selected: true}).e);
                suppliers.forEach(e => {
                    sel_suppliers.appendChild(new Option({value: e.supplier_id, text: e._name}).e);
                })
            }
        },
        {
            table: 'suppliers',
            query: []
        }
    );
};
function resetAddSize() {
    ['_issueable', '_orderable', '_nsns', '_serials'].forEach(e => {
        let select = document.querySelector(`#${e}`);
        if (select) select.value = '0';
    });
    ['_demand_page', '_demand_cell', '_size'].forEach(e => {
        let select = document.querySelector(`#${e}`);
        if (select) select.value = '';
    });
    let select1 = document.querySelector('#_ordering_details');
    if (select1) select1.innerText = '';
    let select2 = document.querySelector('#supplier_id');
    if (select2) select2.value = '';
};
document.querySelector('#reset_size_add').addEventListener('click', getSuppliers);
document.querySelector('#reset_size_add').addEventListener('click', resetAddSize);
window.addEventListener('load', function () {
    addFormListener(
        'form_size_add',
        'POST',
        '/stores/sizes',
        {onComplete: [
            getSizes,
            function () {
                ['_demand_cell', '_size'].forEach(e => {
                    let select = document.querySelector(`#${e}`);
                    if (select) select.value = '';
                });
            }
        ]}
    );
})