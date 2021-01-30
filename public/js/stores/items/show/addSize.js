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
    let _size       = document.querySelector('#_size');
        supplier_id = document.querySelector('#supplier_id');
    if (_size)       _size.value = '';
};
document.querySelector('#reload_size_add').addEventListener('click', getSuppliers);
document.querySelector('#reload_size_add').addEventListener('click', resetAddSize);
window.addEventListener('load', function () {
    $('#mdl_size_add').on('show.bs.modal', getSuppliers);
    $('#mdl_size_add').on('show.bs.modal', resetAddSize);
    remove_attribute({id: 'btn_size_add', attribute: 'disabled'});
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