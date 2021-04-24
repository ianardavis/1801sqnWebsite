function addAddressDeleteBtn(supplier_address_id) {
    let address_delete_btn = document.querySelector('#address_delete_btn');
    if (address_delete_btn) {
        address_delete_btn.innerHTML = '';
        get({
            table: 'address',
            query: [`supplier_address_id=${supplier_address_id}`]
        })
        .then(function ([address, options]) {
            address_delete_btn.appendChild(
                new Delete_Button({
                    path: `/addresses/${address.supplier_address_id}`,
                    descriptor: 'address',
                    options: {
                        onComplete: [
                            getAddresses,
                            function () {$('#mdl_address_view').modal('hide')}
                        ]
                    }
                }).e
            );
        });
    };
};
window.addEventListener('load', function () {
    $('#mdl_address_view').on('show.bs.modal', function (event) {addAddressDeleteBtn(event.relatedTarget.dataset.id)})
});