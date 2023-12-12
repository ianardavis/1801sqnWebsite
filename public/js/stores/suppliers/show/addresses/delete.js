function addAddressDeleteBtn(event) {
    setAttribute('address_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    enableButton('address_delete');
    addFormListener(
        'address_delete',
        'DELETE',
        '/addresses',
        {
            onComplete: [
                getAddresses,
                function () {modalHide('address_view')}
            ]
        }
    );
    modalOnShow('address_view', addAddressDeleteBtn);
});