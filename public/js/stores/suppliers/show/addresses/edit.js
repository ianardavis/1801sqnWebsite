function viewAddressEdit(address_id) {
    get({
        table:   'address',
        query:   [`supplier_address_id=${address_id}`],
        spinner: 'address_edit'
    })
    .then(function ([address, options]) {
        set_attribute({id: 'supplier_address_id_edit', attribute: 'value', value: address.supplier_address_id});
        set_value({id: 'address_type_edit',        value: address.address.type});
        set_value({id: 'address_unit_number_edit', value: address.address.unit_number});
        set_value({id: 'address_street_edit',      value: address.address.street});
        set_value({id: 'address_town_edit',        value: address.address.town});
        set_value({id: 'address_county_edit',      value: address.address.county});
        set_value({id: 'address_country_edit',     value: address.address.country});
        set_value({id: 'address_postcode_edit',    value: address.address.postcode});
        modalHide('address_view');
    })
    .catch(err => {
        modalHide('address_view');
    });
};
function addAddressEditBtn(address_id) {
    let address_edit_btn = document.querySelector('#address_edit_btn');
    if (address_edit_btn) {
        address_edit_btn.innerHTML = '';
        get({
            table: 'address',
            query: [`supplier_address_id=${address_id}`]
        })
        .then(function ([address, options]) {
            address_edit_btn.appendChild(new Button({
                modal:   'address_edit',
                data:    [{field: 'id', value: address.supplier_address_id}],
                type:    'edit',
            }).e);
        });
    };
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