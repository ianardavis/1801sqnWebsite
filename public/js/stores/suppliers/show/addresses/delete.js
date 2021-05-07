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
                            function () {modalHide('address_view')}
                        ]
                    }
                }).e
            );
        });
    };
};
window.addEventListener('load', function () {
    modalOnShow('address_view', function (event) {addAddressDeleteBtn(event.relatedTarget.dataset.id)});
});