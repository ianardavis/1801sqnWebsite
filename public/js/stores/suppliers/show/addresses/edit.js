function viewAddressEdit(address_id) {
    get({
        table: 'address',
        where: {supplier_address_id: address_id}
    })
    .then(function ([address, options]) {
        setAttribute('supplier_address_id_edit', 'value', address.address_id);
        setValue('address_type_edit',        address.address.type);
        setValue('address_unit_number_edit', address.address.unit_number);
        setValue('address_street_edit',      address.address.street);
        setValue('address_town_edit',        address.address.town);
        setValue('address_county_edit',      address.address.county);
        setValue('address_country_edit',     address.address.country);
        setValue('address_postcode_edit',    address.address.postcode);
        modalHide('address_view');
    })
    .catch(err => {
        modalHide('address_view');
    });
};
function addAddressEditBtn(address_id) {
    clear('address_edit_btn')
    .then(address_edit_btn => {
        get({
            table: 'address',
            where: {supplier_address_id: address_id}
        })
        .then(function ([address, options]) {
            address_edit_btn.appendChild(new Modal_Button(
                _edit(),
                'address_edit',
                [{field: 'id', value: address.supplier_address_id}],
                false,
                {colour: 'warning'}
            ).e);
        });
    });
};
window.addEventListener('load', function() {
    addFormListener(
        'address_edit',
        'PUT',
        `/addresses`,
        {
            onComplete: [
                getAddresses,
                function () {modalHide('address_edit')}
            ]
        }
    );
    modalOnShow('address_view', function(event) {addAddressEditBtn(event.relatedTarget.dataset.id)});
    modalOnShow('address_edit', function(event) {
        viewAddressEdit(event.relatedTarget.dataset.id);
        modalHide('address_view');
    });
});